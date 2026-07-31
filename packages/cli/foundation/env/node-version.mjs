// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Node.js version preflight — runtime support gate.
 *
 * The CLI (and its dependencies) rely on `styleText` from `node:util`, which
 * was only added in Node 22.13.0. On older runtimes the lazy-loaded
 * subcommands die with a cryptic ESM error:
 *
 *   failed to load: The requested module 'node:util' does not provide an
 *   export named 'styleText'
 *
 * This module exposes a tiny, dependency-free comparison helper so the entry
 * point can gate on the running Node version BEFORE importing anything that
 * touches `styleText`, and surface a clear "upgrade Node" message instead.
 *
 * Kept free of any non-builtin imports so it can run on the unsupported
 * runtimes it is meant to guard against.
 */

/** Minimum supported Node.js version. */
export const MIN_NODE_VERSION = '22.13.0';

/**
 * Parse a Node.js version string ("22.14.1", "v20.10.0", "16.20.2-nightly")
 * into a {major, minor, patch} record. Missing or non-numeric segments
 * default to 0.
 *
 * @param {string} version
 * @returns {{major: number, minor: number, patch: number}}
 */
export function parseNodeVersion(version) {
  const cleaned = String(version).trim().replace(/^v/, '');
  const [major = 0, minor = 0, patch = 0] = cleaned
    .split('.')
    .map((seg) => parseInt(seg, 10) || 0);
  return {major, minor, patch};
}

/**
 * Returns true when `version` is greater than or equal to `minimum`.
 * Compares major, then minor, then patch.
 *
 * @param {string} version - the running Node version (e.g. process.versions.node)
 * @param {string} [minimum] - the minimum supported version
 * @returns {boolean}
 */
export function isNodeVersionSupported(version, minimum = MIN_NODE_VERSION) {
  const v = parseNodeVersion(version);
  const min = parseNodeVersion(minimum);
  if (v.major !== min.major) return v.major > min.major;
  if (v.minor !== min.minor) return v.minor > min.minor;
  return v.patch >= min.patch;
}

/**
 * Builds the friendly, human-facing message shown when the runtime is too old.
 *
 * @param {string} version - the running Node version
 * @param {string} [minimum] - the minimum supported version
 * @returns {string}
 */
export function unsupportedNodeMessage(version, minimum = MIN_NODE_VERSION) {
  const clean = String(version).trim().replace(/^v/, '');
  return (
    `astryx requires Node.js >=${minimum} (you have v${clean}). ` +
    `Please upgrade Node and try again.`
  );
}
