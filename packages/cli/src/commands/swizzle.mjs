// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file swizzle command — Copy component source for customization
 *
 * Resolves component source from packages/core/src/{Component}/,
 * copies non-test files to the output directory, and rewrites
 * relative imports to use '@xds/core' package paths.
 *
 * After swizzling, optionally prompts the user to file a gap report
 * explaining why they needed to customize the component.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as p from '@clack/prompts';
import {findCoreDir, listComponents} from '../utils/paths.mjs';
import {assertWithin, PathSafetyError, isNonInteractive} from '../utils/path-safety.mjs';
import {isInteractive} from '../utils/interactive.mjs';
import {jsonOut, jsonError, humanLog} from '../lib/json.mjs';
import {
  buildGapReportPreview,
  checkGhCli,
  createGapReport,
  loadGapReportConfig,
  GAP_CATEGORIES,
} from '../utils/github.mjs';
import {shouldActuallyFile, formatPreview} from './gap-report.mjs';

/**
 * Rewrite relative imports that point outside the component directory
 * to use @xds/core package paths.
 *
 * e.g. '../theme/tokens.stylex' -> '@xds/core/theme'
 *      '../utils/mergeProps'     -> '@xds/core/utils'
 */
export function rewriteImports(content) {
  // Match import/export from statements with relative paths going up
  return content.replace(
    /(from\s+['"])(\.\.\/.+?)(['"])/g,
    (match, prefix, importPath, suffix) => {
      // Extract the top-level directory from the relative path
      // e.g. '../theme/tokens.stylex' -> 'theme'
      // e.g. '../utils/mergeProps' -> 'utils'
      const parts = importPath.replace(/^\.\.\//, '').split('/');
      const topDir = parts[0];

      // Map to @xds/core subpath
      return `${prefix}@xds/core/${topDir}${suffix}`;
    },
  );
}

function isCancel(value) {
  if (p.isCancel(value)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }
  return value;
}

export function registerSwizzle(program) {
  program
    .command('swizzle [component]')
    .description('Copy component source for customization')
    .option('--output <dir>', 'Output directory', './components/xds')
    .option('--list', 'List available components')
    .option('--gap <reason>', 'File a gap report explaining why you swizzled')
    .option('--gap-category <category>', 'Gap category (for --gap mode)')
    .option(
      '--no-report',
      'Suppress all gap reporting (interactive prompt AND --gap auto-filing)',
    )
    .option(
      '--dry-run',
      'For --gap: print the issue that would be filed without contacting GitHub. Default in non-TTY / --json mode.',
    )
    .option(
      '--commit',
      'For --gap: actually file the issue. Required in non-interactive mode.',
    )
    .option('-f, --overwrite', 'Overwrite existing files without prompting')
    .action(async (component, options) => {
      const coreDir = findCoreDir(process.cwd());
      const json = program.opts().json || false;

      if (!coreDir) {
        if (json) return jsonError('Could not find @xds/core package');
        console.error(
          'Error: Could not find @xds/core package.\n' +
            'Make sure you are inside the XDS monorepo or have @xds/core installed.',
        );
        process.exit(1);
      }

      const components = listComponents(coreDir);

      if (options.list || !component) {
        if (json) return jsonOut('swizzle.list', components);
        humanLog('\nAvailable components:\n');
        for (const name of components) {
          humanLog(`  ${name}`);
        }
        humanLog(`\nUsage: xds swizzle <component>\n`);
        humanLog('Example: xds swizzle Button');
        humanLog('         xds swizzle XDSButton  (XDS prefix also works)\n');
        return;
      }

      const dirName = component.replace(/^XDS/, '');
      const componentDir = path.join(coreDir, 'src', dirName);

      if (!fs.existsSync(componentDir)) {
        if (json) return jsonError(`Component "${component}" not found`, components.slice(0, 5).map(n => ({name: n, reason: 'available component'})));
        console.error(`Error: Component "${component}" not found.`);
        console.error(`Available: ${components.join(', ')}`);
        process.exit(1);
      }

      // Path-safety: --output must resolve inside cwd. Reject absolute
      // paths and `..` traversal up front, before any directory is created.
      let outputBase;
      try {
        outputBase = assertWithin(options.output, process.cwd(), {
          label: 'output directory',
        });
      } catch (err) {
        if (err instanceof PathSafetyError) {
          if (json) return jsonError(err.message);
          console.error(`Error: ${err.message}`);
          process.exit(1);
        }
        throw err;
      }
      const outputDir = path.join(outputBase, dirName);

      // Pre-flight overwrite check: collect files we'd write and detect
      // collisions before mkdir/writeFile so we never half-clobber.
      const sourceFiles = fs.readdirSync(componentDir).filter(file => {
        if (file.includes('.test.') || file === 'README.md') return false;
        const stat = fs.statSync(path.join(componentDir, file));
        return stat.isFile();
      });

      const existingFiles = sourceFiles.filter(f =>
        fs.existsSync(path.join(outputDir, f)),
      );

      if (existingFiles.length > 0 && !options.overwrite) {
        const relOutputForMsg = path.relative(process.cwd(), outputDir) || '.';
        if (json || isNonInteractive({json})) {
          const msg =
            `Refusing to overwrite ${existingFiles.length} existing file(s) in ${relOutputForMsg}/. ` +
            `Re-run with --overwrite (or -f) to replace them.`;
          if (json) return jsonError(msg);
          console.error(`Error: ${msg}`);
          process.exit(1);
        }
        const confirmed = isCancel(
          await p.confirm({
            message:
              `Overwrite ${existingFiles.length} existing file(s) in ${relOutputForMsg}/? ` +
              `(${existingFiles.slice(0, 3).join(', ')}${existingFiles.length > 3 ? ', …' : ''})`,
            initialValue: false,
          }),
        );
        if (!confirmed) {
          humanLog('Aborted. Re-run with --overwrite to replace files.');
          return;
        }
      }

      fs.mkdirSync(outputDir, {recursive: true});

      // Copy all non-test, non-README files
      const files = fs.readdirSync(componentDir);
      let copied = 0;

      for (const file of files) {
        // Skip test files and README
        if (file.includes('.test.') || file === 'README.md') continue;

        const srcPath = path.join(componentDir, file);
        const stat = fs.statSync(srcPath);
        if (!stat.isFile()) continue;

        let content = fs.readFileSync(srcPath, 'utf-8');

        // Rewrite imports for .ts/.tsx files
        if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          content = rewriteImports(content);
        }

        fs.writeFileSync(path.join(outputDir, file), content);
        copied++;
      }

      const relOutput = path.relative(process.cwd(), outputDir);
      const copiedFiles = files.filter(f => !f.includes('.test.') && f !== 'README.md' && fs.statSync(path.join(componentDir, f)).isFile());

      // --- Gap reporting ---

      const gapConfig = loadGapReportConfig();
      let gapReportUrl = null;
      let gapDryRunPreview = null;

      // CRITICAL: --no-report must suppress BOTH the interactive prompt AND
      // the --gap auto-file path. Previously --gap bypassed --no-report.
      // commander sets options.report to false for `--no-report`.
      const reportingSuppressed = options.report === false;

      if (options.gap && !reportingSuppressed && gapConfig.enabled) {
        const category = options.gapCategory || 'other';
        const previewArgs = {
          component: dirName,
          category,
          intention: options.gap,
          source: 'llm-auto',
        };

        const willFile = shouldActuallyFile({
          commit: options.commit,
          dryRun: options.dryRun,
          json,
        });

        const preview = buildGapReportPreview(previewArgs);

        if (!willFile) {
          // Dry-run: do NOT call gh. Surface what would have been filed.
          gapDryRunPreview = {
            dryRun: true,
            wouldFile: preview.mode !== 'disabled',
            mode: preview.mode,
            title: preview.title,
            body: preview.body,
            repo: preview.repo,
            command: preview.command || null,
          };
        } else if (gapConfig.command || checkGhCli()) {
          try {
            gapReportUrl = createGapReport(previewArgs);
          } catch (err) {
            if (!json)
              console.error(`Warning: Could not file gap report: ${err.message}`);
          }
        }
      }

      if (options.gap) {
        if (json)
          return jsonOut('swizzle.copy', {
            component: dirName,
            outputDir: relOutput,
            filesCopied: copied,
            files: copiedFiles.map(f => f),
            gapReport: gapReportUrl,
            gapReportDryRun: gapDryRunPreview,
            gapReportSuppressed: reportingSuppressed || !gapConfig.enabled,
          });
        humanLog(`\n✓ Copied ${copied} files to ${relOutput}/\n`);
        humanLog('Relative imports have been rewritten to use @xds/core.');
        humanLog('You can now customize the component source freely.\n');
        if (gapReportUrl) {
          humanLog(`✓ Gap report filed: ${gapReportUrl}\n`);
        } else if (gapDryRunPreview) {
          humanLog(formatPreview(buildGapReportPreview({
            component: dirName,
            category: options.gapCategory || 'other',
            intention: options.gap,
            source: 'llm-auto',
          })));
          humanLog(
            '\n[dry-run] No gap report was filed. Re-run with --commit to file.',
          );
        } else if (reportingSuppressed) {
          humanLog('Gap reporting suppressed by --no-report.');
        } else if (!gapConfig.enabled) {
          humanLog('Gap reporting is disabled via configuration.');
        } else if (!gapConfig.command && !checkGhCli()) {
          humanLog('Skipping gap report: gh CLI not available.');
        }
        return;
      }

      if (json) return jsonOut('swizzle.copy', {component: dirName, outputDir: relOutput, filesCopied: copied, files: copiedFiles.map(f => f)});

      humanLog(`\n✓ Copied ${copied} files to ${relOutput}/\n`);
      humanLog('Relative imports have been rewritten to use @xds/core.');
      humanLog('You can now customize the component source freely.\n');

      if (reportingSuppressed || !gapConfig.enabled) {
        return;
      }

      // Interactive gap report prompt
      //
      // This prompt is OPTIONAL — the swizzle copy already succeeded above.
      // In a non-interactive context (CI, piped I/O, no TTY) we must not
      // block on it; skip gracefully rather than hang. Use --gap with
      // explicit flags for non-interactive gap reporting.
      if (!isInteractive()) {
        return;
      }

      if (!gapConfig.command && !checkGhCli()) {
        // Silently skip if gh isn't available and no custom command configured
        return;
      }

      const shouldReport = isCancel(
        await p.confirm({
          message: 'Would you like to report why you swizzled this component?',
          initialValue: false,
        }),
      );

      if (!shouldReport) return;

      const category = isCancel(
        await p.select({
          message: 'What kind of gap is this?',
          options: GAP_CATEGORIES,
        }),
      );

      const intention = isCancel(
        await p.text({
          message: 'What were you trying to achieve?',
          placeholder:
            'e.g. "Need a compact variant for use in dense data tables"',
          validate: val => {
            if (!val.trim()) return 'Please describe what you were trying to do';
          },
        }),
      );

      const detail = isCancel(
        await p.text({
          message: 'Any additional context? (optional)',
          placeholder: 'Press Enter to skip',
        }),
      );

      const previewArgs = {
        component: dirName,
        category,
        intention: intention.trim(),
        detail: detail?.trim() || undefined,
        source: 'interactive',
      };

      const preview = buildGapReportPreview(previewArgs);

      p.note(
        `${preview.mode === 'github' ? `Repo: ${preview.repo}` : `Custom command: ${preview.command}`}\n\n` +
          `Title:\n  ${preview.title}\n\n` +
          `Body:\n${preview.body
            .split('\n')
            .map(l => `  ${l}`)
            .join('\n')}`,
        'Preview — this is exactly what will be filed',
      );

      const confirmFile = isCancel(
        await p.confirm({
          message: 'File this gap report now?',
          initialValue: false,
        }),
      );

      if (!confirmFile) {
        humanLog('Cancelled — nothing was filed.');
        return;
      }

      const s = p.spinner();
      s.start('Filing gap report');

      try {
        const url = createGapReport(previewArgs);
        s.stop('Gap report filed');
        humanLog(`✓ ${url}\n`);
      } catch (err) {
        s.stop('Failed to file gap report');
        console.error(`Warning: Could not file gap report: ${err.message}`);
      }
    });
}
