// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file init command — thin wrapper around the init API.
 *
 * `astryx init` is non-interactive by default: it installs the AGENTS.md/
 * CLAUDE.md cheat sheet with NO prompts, so it behaves identically for humans,
 * AI agents, CI, and piped I/O — it never hangs or errors on a missing TTY.
 * Non-interactive feature install: `astryx init --features agents,theme,template`
 * Re-runnable: safe to run multiple times, idempotent.
 *
 * All logic + side effects live in api/init/init.mjs. This handler only parses
 * flags, wires a plain logger to the CLI's humanLog/console.error, calls init(),
 * and maps the receipt's soft agent-docs error to the exit code.
 */

import {init} from '../../../api/init/init.mjs';
import {logger} from '../../../api/logger.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {defineCommand} from '../lib/define-command.mjs';
import {doc as initCommand} from './init.doc.mjs';
import {doc as initFn} from '../../../api/init/init.doc.mjs';

/**
 * @param {import('commander').Command} program
 */
export function registerInit(program) {
  defineCommand(program, initCommand, {
    fn: initFn,
    action: async (/** @type {import('../../../api/init/init.mjs').InitOptions} */ options) => {
      // init has no --json mode: enable human output (log → stdout via humanLog,
      // warn/error → stderr). humanLog still self-suppresses under a global
      // --json flag, so a JSON envelope can never be corrupted.
      logger.setSilent(false);
      try {
        const receipt = await init(options, {cwd: process.cwd()});
        // A path-safety failure already printed its error but the run
        // continued; reflect it in the exit code (historical soft-error policy).
        if (receipt.type === 'init.run' && receipt.data.docsError?.kind === 'path-safety') {
          process.exitCode = 1;
        }
      } catch (err) {
        const e = /** @type {import('../../../api/error.mjs').AstryxError} */ (err);
        cliError(e.message, {suggestions: e.suggestions, code: e.code});
      }
    },
  });
}
