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
 * Call sites use it as `import * as p from './term-log.mjs'` and call
 * `p.log.info(...)`, `p.intro(...)`, `p.outro(...)`.
 *
 * For API functions that emit progress without knowing how it's rendered, this
 * module also exports an *injectable* flat logger (`CliLogger`): the CLI passes
 * `termLogger` (routes here → stdout, suppressed in --json); programmatic
 * callers get the silent `noopLogger` default, so a scripted API call stays
 * quiet even though it isn't in --json mode.
 */

import {humanLog} from './json.mjs';

/** @param {unknown} msg */
const toStr = (msg) => (msg === undefined || msg === null ? '' : String(msg));

/**
 * Human-facing log surface (the small `log` API the CLI uses). All lines go to
 * stdout via humanLog; the level prefixes are cosmetic. `--json` mode suppresses
 * every one of these, keeping machine-readable stdout clean.
 */
export const log = {
  /** @param {unknown} msg */
  message: (msg) => humanLog(toStr(msg)),
  /** @param {unknown} msg */
  info: (msg) => humanLog(toStr(msg)),
  /** @param {unknown} msg */
  step: (msg) => humanLog(toStr(msg)),
  /** @param {unknown} msg */
  success: (msg) => humanLog(`✓ ${toStr(msg)}`),
  /** @param {unknown} msg */
  warn: (msg) => humanLog(`⚠ ${toStr(msg)}`),
  /** @param {unknown} msg */
  error: (msg) => humanLog(`✗ ${toStr(msg)}`),
};

/** Banner printed at the start of a multi-step command.
 * @param {unknown} title */
export function intro(title) {
  humanLog(`\n${toStr(title)}`);
}

/** Footer printed at the end of a multi-step command.
 * @param {unknown} message */
export function outro(message) {
  humanLog(`${toStr(message)}\n`);
}

/**
 * Injectable flat logger for API functions (side-effecting/long-running
 * commands like upgrade). The API calls `logger.step(...)` etc. and defaults to
 * `noopLogger`; the CLI hands it `termLogger`. Purely presentation — the API
 * still returns its `{type, data}` result / throws.
 *
 * @typedef {object} CliLogger
 * @property {(m?: unknown) => void} intro
 * @property {(m?: unknown) => void} step
 * @property {(m?: unknown) => void} info
 * @property {(m?: unknown) => void} warn
 * @property {(m?: unknown) => void} success
 * @property {(m?: unknown) => void} error
 * @property {(m?: unknown) => void} outro
 */

/** Silent logger — the default for programmatic API callers. @type {CliLogger} */
export const noopLogger = {
  intro() {},
  step() {},
  info() {},
  warn() {},
  success() {},
  error() {},
  outro() {},
};

/** term-log-backed logger — used by the CLI in human (non --json) mode. @type {CliLogger} */
export const termLogger = {
  intro: msg => intro(msg),
  step: msg => log.step(msg),
  info: msg => log.info(msg),
  warn: msg => log.warn(msg),
  success: msg => log.success(msg),
  error: msg => log.error(msg),
  outro: msg => outro(msg),
};
