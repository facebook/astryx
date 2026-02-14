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
import {
  checkGhCli,
  createGapReport,
  loadGapReportConfig,
  GAP_CATEGORIES,
} from '../utils/github.mjs';

/**
 * Rewrite relative imports that point outside the component directory
 * to use @xds/core package paths.
 *
 * e.g. '../theme/tokens.stylex' -> '@xds/core/theme'
 *      '../utils/mergeProps'     -> '@xds/core/utils'
 */
function rewriteImports(content) {
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
    .option('--no-report', 'Suppress the interactive gap report prompt')
    .action(async (component, options) => {
      const coreDir = findCoreDir(process.cwd());

      if (!coreDir) {
        console.error(
          'Error: Could not find @xds/core package.\n' +
            'Make sure you are inside the XDS monorepo or have @xds/core installed.',
        );
        process.exit(1);
      }

      const components = listComponents(coreDir);

      if (options.list || !component) {
        console.log('\nAvailable components:\n');
        for (const name of components) {
          console.log(`  ${name}`);
        }
        console.log(`\nUsage: xds swizzle <component>\n`);
        console.log('Example: xds swizzle Button');
        console.log('         xds swizzle XDSButton  (XDS prefix also works)\n');
        return;
      }

      // Normalize component name — strip XDS prefix for directory lookup
      const dirName = component.replace(/^XDS/, '');
      const componentDir = path.join(coreDir, 'src', dirName);

      if (!fs.existsSync(componentDir)) {
        console.error(`Error: Component "${component}" not found.`);
        console.error(`Available: ${components.join(', ')}`);
        process.exit(1);
      }

      const outputDir = path.resolve(process.cwd(), options.output, dirName);
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
      console.log(`\n✓ Copied ${copied} files to ${relOutput}/\n`);
      console.log('Relative imports have been rewritten to use @xds/core.');
      console.log('You can now customize the component source freely.\n');

      // --- Gap reporting ---

      const gapConfig = loadGapReportConfig();

      // Programmatic gap mode (for LLMs using --gap flag)
      if (options.gap) {
        if (!gapConfig.enabled) {
          console.log('Gap reporting is disabled via configuration.');
          return;
        }
        if (!gapConfig.command && !checkGhCli()) {
          console.log(
            'Skipping gap report: gh CLI not available. Install from https://cli.github.com',
          );
          return;
        }

        const category = options.gapCategory || 'other';
        try {
          const url = createGapReport({
            component: dirName,
            category,
            intention: options.gap,
            source: 'llm-auto',
          });
          if (url) {
            console.log(`✓ Gap report filed: ${url}\n`);
          }
        } catch (err) {
          console.error(`Warning: Could not file gap report: ${err.message}`);
        }
        return;
      }

      // Skip interactive prompt if --no-report or gap reporting disabled
      if (!options.report || !gapConfig.enabled) {
        return;
      }

      // Interactive gap report prompt
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

      const s = p.spinner();
      s.start('Filing gap report');

      try {
        const url = createGapReport({
          component: dirName,
          category,
          intention: intention.trim(),
          detail: detail?.trim() || undefined,
          source: 'interactive',
        });
        s.stop('Gap report filed');
        console.log(`✓ ${url}\n`);
      } catch (err) {
        s.stop('Failed to file gap report');
        console.error(`Warning: Could not file gap report: ${err.message}`);
      }
    });
}
