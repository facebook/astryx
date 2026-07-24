// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Minimal semver utilities for the CLI.
 *
 * We deliberately avoid pulling in `semver` from npm — Astryx releases follow a
 * strict `MAJOR.MINOR.PATCH[-prerelease]` shape and the CLI runs in consumer
 * sandboxes where a smaller dependency surface is preferred.
 */

const SEMVER_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

/**
 * True if `value` looks like a valid semver string (MAJOR.MINOR.PATCH with
 * optional prerelease/build metadata).
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidSemver(value) {
  return typeof value === 'string' && SEMVER_RE.test(value);
}

/**
 * Compare two semver strings numerically.
 *
 * Returns a negative number if `a < b`, positive if `a > b`, 0 if equal.
 * Prerelease tags are stripped — `0.0.5-beta.1` compares equal to `0.0.5`.
 * That's adequate for the upgrade gate, which only cares about ordering of
 * released versions.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function semverCompare(a, b) {
  const pa = String(a).split('-')[0].split('.').map(Number);
  const pb = String(b).split('-')[0].split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (Number.isNaN(na) || Number.isNaN(nb)) {
      // Fall back to lexicographic compare on garbage input rather than
      // returning NaN, which would silently break sort/filter callers.
      return String(a).localeCompare(String(b));
    }
    if (na !== nb) return na - nb;
  }
  return 0;
}

/**
 * `true` if `a` is greater than or equal to `b` in semver order.
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function semverGte(a, b) {
  return semverCompare(a, b) >= 0;
}

/**
 * `true` if `a` is strictly greater than `b` in semver order.
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function semverGt(a, b) {
  return semverCompare(a, b) > 0;
}
