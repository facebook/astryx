// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Internal JSON output helpers and the CLI's "JSON is always JSON"
 * contract.
 *
 * The contract has four guarantees, enforced here and in index.mjs:
 *
 *   1. EVERY emission in --json mode is a single valid JSON envelope.
 *      Success: { apiVersion, type, data }
 *      Error:   { apiVersion, error, code, suggestions? }
 *      The `code` is a stable, machine-readable identifier (see
 *      error-codes.mjs). Consumers should branch on `code`, never on the
 *      human-readable `error` string.
 *   2. Commands that don't support --json are rejected BEFORE any side
 *      effect (preAction gate in index.mjs).
 *   3. Human-facing chatter is suppressed in --json mode (see humanLog /
 *      setJsonMode) so it can never corrupt stdout.
 *   4. Uncaught throws in --json mode become a JSON error envelope, never a
 *      raw stack trace (see toErrorEnvelope / the bin error boundary).
 *
 * Commands call jsonOut({type, data}) for success and jsonError(msg) for
 * errors. Consumer-facing utilities (parseResponse, isError, assertResponse)
 * live in parse.mjs and are exported via @astryxdesign/cli/json.
 */

/**
 * Version of the JSON envelope contract. Bump on breaking shape changes so
 * consumers can negotiate. Exposed on every envelope as `apiVersion`.
 */
import {ERROR_CODES} from './error-codes.mjs';

export const API_VERSION = 1;

/**
 * Process-wide flag: are we emitting machine-readable JSON? Set once, early,
 * from the parsed --json option (see setJsonMode in index.mjs). Read by
 * humanLog() so human output is suppressed without every call site having to
 * thread a `json` boolean.
 *
 * @type {boolean}
 */
let _jsonMode = false;

/**
 * Enable/disable JSON mode globally. Called once from index.mjs as soon as
 * the root options are known (preAction), before any command body runs.
 * @param {boolean} on
 */
export function setJsonMode(on) {
  _jsonMode = Boolean(on);
}

/** @returns {boolean} */
export function isJsonMode() {
  return _jsonMode;
}

/**
 * Human-facing output that is automatically suppressed in --json mode.
 *
 * This is the stdout-discipline primitive: instead of scattering
 * `if (!json) console.log(...)` across commands (easy to forget, and one
 * miss corrupts the JSON), route all human chatter through humanLog. In JSON
 * mode it is a no-op, guaranteeing stdout carries only the JSON envelope.
 *
 * @param {...unknown} args
 */
export function humanLog(...args) {
  if (_jsonMode) return;
  console.log(...args);
}

/**
 * Human-facing stderr (warnings, hints). Also suppressed in JSON mode so a
 * stray warning can't interleave with piped output. Use jsonError for real
 * errors that must reach a JSON consumer.
 * @param {...unknown} args
 */
export function humanWarn(...args) {
  if (_jsonMode) return;
  console.error(...args);
}

/**
 * Output a JSON response envelope and mark it handled.
 *
 * Structural serializer: pass a command/API result straight through as
 * `{type, data, meta?}`. There is no central response union — the correctness
 * of the `type` discriminator is guaranteed at each API function's `@returns`
 * (that's the fractal source-of-truth point), not by a map in this file.
 *
 * @param {{type: string, data: unknown, meta?: Record<string, unknown>}} response
 * @returns {void}
 */
export function jsonOut(response) {
  /** @type {any} */
  const envelope = {apiVersion: API_VERSION, type: response.type, data: response.data};
  if (response.meta !== undefined) envelope.meta = response.meta;
  // Serialize BEFORE marking handled. If JSON.stringify throws (a circular
  // reference or a BigInt in `data` — an author bug in a command's return
  // value), the `__xdsJsonHandled` flag must stay unset so the bin error
  // boundary is still free to emit a JSON error envelope. Setting the flag
  // first leaves a --json consumer with empty stdout + exit 1 (an unparseable
  // non-envelope), violating the "every --json emission is a single valid
  // envelope" contract.
  const out = JSON.stringify(envelope, null, 2);
  process.__xdsJsonHandled = true;
  console.log(out);
}

/**
 * Build a structured error envelope without emitting it. Used by the bin
 * error boundary to convert an uncaught throw into the contract's error
 * shape.
 *
 * The `code` is resolved in priority order: an explicit `code` argument,
 * then a `code` property carried on a thrown Error/AstryxError, then the
 * generic `ERR_UNKNOWN` fallback. It always appears on the envelope so
 * consumers can branch on it unconditionally.
 *
 * @param {unknown} err
 * @param {import('./base').Suggestion[]} [suggestions]
 * @param {string} [code] - Explicit stable error code. Overrides any code
 *   carried on a thrown Error.
 * @returns {{apiVersion: number, error: string, code: string, suggestions?: import('./base').Suggestion[]}}
 */
export function toErrorEnvelope(err, suggestions, code) {
  const message =
    err instanceof Error ? err.message : typeof err === 'string' ? err : String(err);
  const resolvedCode =
    code ||
    (err && typeof err === 'object' &&
    typeof (/** @type {any} */ (err).code) === 'string'
      ? /** @type {any} */ (err).code
      : undefined) ||
    ERROR_CODES.ERR_UNKNOWN;
  /** @type {any} */
  const env = {apiVersion: API_VERSION, error: message, code: resolvedCode};
  if (Array.isArray(suggestions) && suggestions.length) env.suggestions = suggestions;
  return env;
}

/**
 * Output a structured JSON error and exit.
 * @param {string} message
 * @param {import('./base').Suggestion[]} [suggestions]
 * @param {string} [code] - Stable machine-readable error code (error-codes.mjs).
 */
export function jsonError(message, suggestions, code) {
  process.__xdsJsonHandled = true;
  const err = toErrorEnvelope(message, suggestions, code);
  console.log(JSON.stringify(err, null, 2));
  process.exit(1);
}
