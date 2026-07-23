// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Minimal non-interactive terminal logger.
 *
 * @input  message strings from CLI commands/codemods
 * @output plain lines on stdout via humanLog (suppressed in --json mode)
 * @position src/lib — shared output helper, no side effects on import
 *
 * The CLI is fully non-interactive: it never prompts, so it only needs plain,
 * unbuffered output. This provides the *output-only* surface (`log.*`, `intro`,
 * `outro`) the CLI needs, so it has no dependency on any prompt library.
 *
 * All output is routed through `humanLog`, the CLI's stdout-discipline
 * primitive, which is a no-op in `--json` mode — so these human logs can never
 * corrupt a JSON envelope.
 *
 * Call sites use it as `import * as p from '../lib/term-log.mjs'` and call
 * `p.log.info(...)`, `p.intro(...)`, `p.outro(...)`.
 */

import {humanLog} from './json.mjs';

const toStr = (msg) => (msg === undefined || msg === null ? '' : String(msg));

/**
 * Human-facing log surface (the small `log` API the CLI uses). All lines go to
 * stdout via humanLog; the level prefixes are cosmetic. `--json` mode suppresses
 * every one of these, keeping machine-readable stdout clean.
 */
export const log = {
  message: (msg) => humanLog(toStr(msg)),
  info: (msg) => humanLog(toStr(msg)),
  step: (msg) => humanLog(toStr(msg)),
  success: (msg) => humanLog(`✓ ${toStr(msg)}`),
  warn: (msg) => humanLog(`⚠ ${toStr(msg)}`),
  error: (msg) => humanLog(`✗ ${toStr(msg)}`),
};

/** Banner printed at the start of a multi-step command. */
export function intro(title) {
  humanLog(`\n${toStr(title)}`);
}

/** Footer printed at the end of a multi-step command. */
export function outro(message) {
  humanLog(`${toStr(message)}\n`);
}
