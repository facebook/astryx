// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file swizzle command — Copy component source for customization
 *
 * Resolves component source from packages/core/src/{Component}/,
 * copies non-test files to the output directory, and rewrites
 * relative imports to use '@astryxdesign/core' package paths.
 *
 * After swizzling, prints a short maintainer feedback note pointing
 * users at the issue tracker so they can let the team know what gap
 * led them to customize the component.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as p from '@clack/prompts';
import {findCoreDir, listComponents} from '../utils/paths.mjs';
import {
  assertWithin,
  PathSafetyError,
  isNonInteractive,
} from '../utils/path-safety.mjs';
import {jsonOut, humanLog} from '../lib/json.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {ERROR_CODES} from '../lib/error-codes.mjs';
import {checkGhCli} from '../utils/github.mjs';

/** Default issue tracker for maintainer feedback after swizzling. */
const DEFAULT_ISSUES_URL = 'https://github.com/facebook/astryx/issues/new';

/**
 * Rewrite relative imports that point outside the component directory
 * to use @astryxdesign/core package paths.
 *
 * e.g. '../theme/tokens.stylex' -> '@astryxdesign/core/theme'
 *      '../utils/mergeProps'     -> '@astryxdesign/core/utils'
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

      // Map to @astryxdesign/core subpath
      return `${prefix}@astryxdesign/core/${topDir}${suffix}`;
    },
  );
}

/**
 * Build the maintainer feedback note for a swizzled component.
 *
 * Returns { issuesUrl, ghCommand? }. When the issues URL is a GitHub
 * "new issue" URL and the `gh` CLI is available, a ready-to-run
 * `gh issue create` command is included so the user can file feedback
 * without leaving the terminal.
 */
function buildFeedback(component) {
  const issuesUrl = DEFAULT_ISSUES_URL;
  const feedback = {issuesUrl};

  const match = issuesUrl.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/new\/?$/,
  );
  if (match && checkGhCli()) {
    const [, owner, repo] = match;
    feedback.ghCommand = `gh issue create --repo ${owner}/${repo} --title "[${component}] Swizzle feedback"`;
  }

  return feedback;
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
    .option('--output <dir>', 'Output directory', './components/astryx')
    .option('--list', 'List available components')
    .option('-f, --overwrite', 'Overwrite existing files without prompting')
    .action(async (component, options) => {
      const coreDir = findCoreDir(process.cwd());
      const json = program.opts().json || false;

      if (!coreDir) {
        cliError(
          'Could not find @astryxdesign/core package. Make sure you are inside the design system monorepo or have @astryxdesign/core installed.',
          {code: ERROR_CODES.ERR_CORE_NOT_FOUND},
        );
        return;
      }

      const components = listComponents(coreDir);

      if (options.list || !component) {
        if (json) return jsonOut('swizzle.list', components);
        humanLog('\nAvailable components:\n');
        for (const name of components) {
          humanLog(`  ${name}`);
        }
        humanLog(`\nUsage: astryx swizzle <component>\n`);
        humanLog('Example: astryx swizzle Button');
        humanLog(
          '         astryx swizzle XDSButton  (XDS prefix also works)\n',
        );
        return;
      }

      const dirName = component.replace(/^XDS/, '');
      const componentDir = path.join(coreDir, 'src', dirName);

      if (!fs.existsSync(componentDir)) {
        cliError(`Component "${component}" not found.`, {
          suggestions: components.slice(0, 10).map(n => ({name: n})),
          code: ERROR_CODES.ERR_UNKNOWN_COMPONENT,
        });
        return;
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
          cliError(err.message, {code: ERROR_CODES.ERR_PATH_TRAVERSAL});
          return;
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
          cliError(msg, {code: ERROR_CODES.ERR_FILE_EXISTS});
          return;
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
      const copiedFiles = files.filter(
        f =>
          !f.includes('.test.') &&
          f !== 'README.md' &&
          fs.statSync(path.join(componentDir, f)).isFile(),
      );

      const feedback = buildFeedback(dirName);

      if (json)
        return jsonOut('swizzle.copy', {
          component: dirName,
          outputDir: relOutput,
          filesCopied: copied,
          files: copiedFiles.map(f => f),
          feedback,
        });

      humanLog(`\n✓ Copied ${copied} files to ${relOutput}/\n`);
      humanLog(
        'Relative imports have been rewritten to use @astryxdesign/core.',
      );
      humanLog('You can now customize the component source freely.\n');

      // Maintainer feedback note. If we couldn't swizzle cleanly, the team
      // wants to know — point users at the issue tracker.
      humanLog(
        'Customizing a component often signals a gap in the design system.',
      );
      humanLog('Let the maintainers know what you needed:');
      if (feedback.ghCommand) {
        humanLog(`  ${feedback.ghCommand}`);
      } else {
        humanLog(`  ${feedback.issuesUrl}`);
      }
      humanLog('');
    });
}
