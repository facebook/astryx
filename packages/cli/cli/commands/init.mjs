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

import {init} from '../../api/init/init.mjs';
import {humanLog} from '../../lib/json.mjs';
import {cliError} from '../../lib/cli-error.mjs';

/**
 * @param {import('commander').Command} program
 */
export function registerInit(program) {
  program
    .command('init')
    .description('Initialize the design system in your project')
    .option('--features <list>', 'Comma-separated features to install (agents, theme, template)')
    .option('--all', 'Install all features, no prompts')
    .option('--remove-agents', 'Remove AI agent docs from all agent doc files')
    .option('--agent <tool>', 'Target AI tool for agent docs: claude, cursor, codex, hermes, all')
    .option('--agent-docs-path <path...>', 'Explicit file path(s) for agent docs')
    .action(async (/** @type {import('../../api/init/init.mjs').InitOptions} */ options) => {
      // Plain logger: init's output is flat humanLog lines (stdout) + raw
      // console.error (stderr), never the clack-style term-log.
      /** @type {import('../../api/init/init.mjs').InitLogger} */
      const logger = {log: humanLog, error: m => console.error(m)};
      try {
        const receipt = await init(options, {cwd: process.cwd(), logger});
        // A path-safety failure already printed its error but the run
        // continued; reflect it in the exit code (historical soft-error policy).
        if (receipt.type === 'init.run' && receipt.data.docsError?.kind === 'path-safety') {
          process.exitCode = 1;
        }
      } catch (err) {
        const e = /** @type {import('../../api/error.mjs').AstryxError} */ (err);
        cliError(e.message, {suggestions: e.suggestions, code: e.code});
      }
    });
}
