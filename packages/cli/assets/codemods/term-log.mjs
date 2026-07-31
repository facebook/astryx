// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Minimal non-interactive terminal output surface for codemods.
 *
 * @input  message strings from codemod runners
 * @output plain lines on stdout via humanLog (suppressed in --json mode)
 * @position lib — shared output helper, no side effects on import
 *
 * Codemod runners use it as `import * as p from './term-log.mjs'` and call
 * `p.log.step(...)`, `p.log.success(...)`, etc. All output routes through
 * `humanLog`, the CLI's stdout-discipline primitive, which is a no-op in
 * `--json` mode — so these human logs can never corrupt a JSON envelope.
 *
 * The side-effecting API commands (upgrade/init/themeBuild) do NOT use this;
 * they write through the shared `logger` (api/logger.mjs).
 */

import {humanLog} from '../../foundation/response/json.mjs';

/** @param {unknown} msg */
const toStr = (msg) => (msg === undefined || msg === null ? '' : String(msg));

/**
 * Human-facing log surface (the small `log` API codemods use). All lines go to
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
