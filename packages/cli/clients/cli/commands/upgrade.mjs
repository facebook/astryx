// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file upgrade command — thin wrapper around api/upgrade.
 *
 * `astryx upgrade` runs codemods that migrate source between Astryx versions and
 * refreshes the managed agent-docs block. All logic lives in api/upgrade; this
 * handler only parses flags, wires the progress logger (term output in human
 * mode, silent in --json), and renders the result / exit code.
 *
 * Consumers bump/install their Astryx packages first, then run:
 *   astryx upgrade --from <old-version> --path <source-dir> --apply
 */

import {jsonOut, jsonError} from '../../../foundation/response/json.mjs';
import {logger} from '../../../api/logger.mjs';
import {AstryxError} from '../../../api/error.mjs';
import {upgrade as upgradeApi} from '../../../api/upgrade/upgrade.mjs';

/**
 * @param {import('commander').Command} program
 */
export function registerUpgrade(program) {
  program
    .command('upgrade')
    .description('Run codemods to migrate between versions')
    .option('--from <version>', 'Previous version before the dependency upgrade')
    .option('--apply', 'Write changes to disk (default: dry-run)', false)
    .option('--force', 'Run codemods even if --from is newer than the installed version', false)
    .option('--codemod <name>', 'Run a specific transform only')
    .option('--skip-codemod <name...>', 'Exclude named codemods (repeatable). Re-run past a failed codemod by skipping it.')
    .option('--integration <package-or-file>', 'Explicit integration package name or integration file path (repeatable)',
      /** @param {string} value @param {string[]} previous */
      (value, previous) => [...(previous ?? []), value], [])
    .option('--path <dir>', 'Source directory to scan', './src')
    .option('--install-deps', 'Auto-install jscodeshift without prompting', false)
    .option('--list', 'List available codemods', false)
    .action(
      /**
       * @param {import('../../../api/upgrade/upgrade.mjs').UpgradeOptions} options
       */
      async options => {
        const json = program.opts().json || false;
        logger.setSilent(json);

        /** @type {import('../../../api/upgrade/upgrade.type.mjs').UpgradeListResponse | import('../../../api/upgrade/upgrade.type.mjs').UpgradeStatusResponse | import('../../../api/upgrade/upgrade.type.mjs').UpgradeRunResponse} */
        let result;
        try {
          result = await upgradeApi(options, {cwd: process.cwd()});
        } catch (e) {
          // Handled failures throw AstryxError: --json emits the structured
          // envelope (byte-identical to the old inline jsonError) + exits 1;
          // human mode already saw the error line + outro via the logger, so we
          // just set the exit code. Anything else is unexpected — let the
          // top-level boundary in bin/astryx.mjs format it as before.
          if (e instanceof AstryxError) {
            if (json) jsonError(e.message, undefined, e.code);
            else process.exitCode = 1;
            return;
          }
          throw e;
        }

        if (json) jsonOut(result);
      },
    );
}
