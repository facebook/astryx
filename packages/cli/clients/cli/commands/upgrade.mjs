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
import {defineCommand} from '../lib/define-command.mjs';
import {upgrade as upgradeApi} from '../../../api/upgrade/upgrade.mjs';
import {doc as upgradeCommand} from './upgrade.doc.mjs';
import {doc as upgradeFn} from '../../../api/upgrade/upgrade.doc.mjs';

/**
 * @param {import('commander').Command} program
 */
export function registerUpgrade(program) {
  const cmd = defineCommand(program, upgradeCommand, {
    fn: upgradeFn,
    action:
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
  });

  // `--integration` is a repeatable value flag: multiple flags accumulate into
  // the string[] the API expects. defineCommand builds a plain value option
  // (its [] default comes from the doc), so restore the collector coercion that
  // the previous inline `.option(..., fn, [])` supplied. Help output is
  // unaffected — only parse-time value assembly.
  const integration = cmd.options.find(o => o.long === '--integration');
  if (integration) {
    integration.argParser(
      /** @param {string} value @param {string[]} previous */
      (value, previous) => [...(previous ?? []), value],
    );
  }
}
