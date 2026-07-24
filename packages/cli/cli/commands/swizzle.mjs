// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file swizzle command — thin wrapper around api/swizzle.
 *
 * Copies a component's source into the consumer project for customization
 * (imports rewritten to the owner package's subpaths). All logic — owner
 * resolution, copy, import rewriting, StyleX detection, maintainer feedback —
 * lives in api/swizzle; this file only parses flags, prints, and prefixes
 * commands for the caller's package manager.
 */

import {jsonOut, humanLog} from '../../lib/json.mjs';
import {cliError} from '../../lib/cli-error.mjs';
import {getCliInvocation} from '../../utils/package-manager.mjs';
import {swizzle as swizzleApi} from '../../api/swizzle/swizzle.mjs';

/**
 * @param {import('commander').Command} program
 */
export function registerSwizzle(program) {
  program
    .command('swizzle [component]')
    .description('Copy component source for customization')
    .option('--output <dir>', 'Output directory', './components/astryx')
    .option('--package <pkg>', 'Scope to a specific owning package')
    .option('--list', 'List available components')
    .option('-f, --overwrite', 'Overwrite existing files without prompting')
    .action(async (/** @type {string | undefined} */ component, /** @type {{output: string, package?: string, list?: boolean, overwrite?: boolean}} */ options) => {
      const json = program.opts().json || false;
      const run = getCliInvocation();

      /** @type {import('../../types/swizzle').SwizzleListResponse | import('../../types/swizzle').SwizzleCopyResponse} */
      let result;
      try {
        result = await swizzleApi(component, {
          cwd: process.cwd(),
          output: options.output,
          package: options.package,
          list: options.list,
          overwrite: options.overwrite,
        });
      } catch (e) {
        const err = /** @type {import('../../api/error.mjs').AstryxError} */ (e);
        cliError(err.message, {suggestions: err.suggestions, code: err.code});
        return;
      }

      if (json) return jsonOut(result.type, result.data);

      if (result.type === 'swizzle.list') {
        const components = result.data;
        humanLog('\nAvailable components:\n');
        for (const name of components) {
          humanLog(`  ${name}`);
        }
        humanLog(`\nUsage: ${run} swizzle <component>\n`);
        humanLog(`Example: ${run} swizzle Button`);
        humanLog(`         ${run} swizzle XDSButton  (XDS prefix also works)\n`);
        return;
      }

      const {package: ownerPackage, outputDir, filesCopied, usesStyleX, feedback} =
        result.data;

      humanLog(`\n✓ Copied ${filesCopied} files to ${outputDir}/\n`);
      humanLog(`Relative imports have been rewritten to use ${ownerPackage}.`);
      humanLog('You can now customize the component source freely.\n');

      // StyleX build requirement — swizzled StyleX source renders unstyled with
      // no error unless the consumer's build runs a StyleX compiler.
      if (usesStyleX) {
        humanLog(
          '⚠ These components use StyleX and require a StyleX compiler in your build.',
        );
        humanLog(
          '  Without one they render unstyled (no error). See setup per framework:',
        );
        humanLog(`  ${run} docs styling`);
        humanLog(
          '  Next.js note: the StyleX Babel plugin disables SWC and breaks next/font —',
        );
        humanLog(
          '  use an SWC-based StyleX transform instead (covered in the guide).',
        );
        humanLog('');
      }

      // Maintainer feedback note (skipped when the owner ships no issues URL).
      if (feedback) {
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
      }
    });
}
