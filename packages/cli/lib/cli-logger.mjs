// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Injectable progress logger for API functions.
 *
 * Side-effecting/long-running API functions (upgrade, theme build) emit human
 * progress WITHOUT knowing how it's rendered. The CLI passes `termLogger`
 * (routes to term-log → stdout, and is suppressed in --json mode); programmatic
 * callers of `@astryxdesign/cli/api` get the silent `noopLogger` default, so a
 * scripted `upgrade(...)` never spams the console. The API still returns its
 * `{type, data}` result / throws AstryxError; the logger is purely presentation.
 */

import * as p from './term-log.mjs';

/**
 * @typedef {object} CliLogger
 * @property {(m?: string) => void} intro
 * @property {(m?: string) => void} step
 * @property {(m?: string) => void} info
 * @property {(m?: string) => void} warn
 * @property {(m?: string) => void} success
 * @property {(m?: string) => void} error
 * @property {(m?: string) => void} outro
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
  intro: m => p.intro(m),
  step: m => p.log.step(m),
  info: m => p.log.info(m),
  warn: m => p.log.warn(m),
  success: m => p.log.success(m),
  error: m => p.log.error(m),
  outro: m => p.outro(m),
};
