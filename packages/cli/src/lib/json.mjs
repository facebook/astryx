// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Internal JSON output helpers and the CLI's "JSON is always JSON"
 * contract.
 *
 * The contract has four guarantees, enforced here and in index.mjs:
 *
 *   1. EVERY emission in --json mode is a single valid JSON envelope.
 *      Success: { apiVersion, type, data }   Error: { apiVersion, error, suggestions? }
 *   2. Commands that don't support --json are rejected BEFORE any side
 *      effect (preAction gate in index.mjs).
 *   3. Human-facing chatter is suppressed in --json mode (see humanLog /
 *      setJsonMode) so it can never corrupt stdout.
 *   4. Uncaught throws in --json mode become a JSON error envelope, never a
 *      raw stack trace (see toErrorEnvelope / the bin error boundary).
 *
 * Commands call jsonOut(type, data) for success and jsonError(msg) for
 * errors. Consumer-facing utilities (parseResponse, isError, assertResponse)
 * live in parse.mjs and are exported via @xds/cli/json.
 */

/**
 * Version of the JSON envelope contract. Bump on breaking shape changes so
 * consumers can negotiate. Exposed on every envelope as `apiVersion`.
 */
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
 * Output a typed JSON response envelope and mark as handled.
 * Type safety enforced via declaration in types/base.d.ts —
 * data must match the declared shape for the given type discriminator.
 * @template {import('../types/base').CLIResponseType} T
 * @param {T} type
 * @param {import('../types/base').CLIResponseDataMap[T]} data
 * @param {Record<string, unknown>} [meta] - Optional sidecar metadata (e.g.
 *   {configured: false}). Emitted as a sibling of data, never merged into it.
 * @returns {void}
 */
export function jsonOut(type, data, meta) {
  process.__xdsJsonHandled = true;
  /** @type {any} */
  const envelope = {apiVersion: API_VERSION, type, data};
  if (meta !== undefined) envelope.meta = meta;
  console.log(JSON.stringify(envelope, null, 2));
}

/**
 * Build a structured error envelope without emitting it. Used by the bin
 * error boundary to convert an uncaught throw into the contract's error
 * shape.
 * @param {unknown} err
 * @param {Array<{name: string, reason: string}>} [suggestions]
 * @returns {{apiVersion: number, error: string, suggestions?: Array<{name: string, reason: string}>}}
 */
export function toErrorEnvelope(err, suggestions) {
  const message =
    err instanceof Error ? err.message : typeof err === 'string' ? err : String(err);
  /** @type {any} */
  const env = {apiVersion: API_VERSION, error: message};
  if (suggestions?.length) env.suggestions = suggestions;
  return env;
}

/**
 * Output a structured JSON error and exit.
 * @param {string} message
 * @param {Array<{name: string, reason: string}>} [suggestions]
 */
export function jsonError(message, suggestions) {
  process.__xdsJsonHandled = true;
  const err = toErrorEnvelope(message, suggestions);
  console.log(JSON.stringify(err, null, 2));
  process.exit(1);
}
