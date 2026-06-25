// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Consumer utilities for parsing Astryx CLI JSON output.
 *
 * Exported via `@astryxdesign/cli/json`:
 *   import { parseResponse, isError, assertResponse } from '@astryxdesign/cli/json';
 */

/**
 * Parse raw CLI output into a typed result.
 * Consumer types are declared in types/base.d.ts — this is the runtime implementation.
 * @param {unknown} raw
 */
export function parseResponse(raw) {
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

/**
 * Type guard: returns true if result is a CLI error.
 * @param {unknown} result
 * @returns {boolean}
 */
export function isError(result) {
  return result != null && typeof result === 'object' && 'error' in result;
}

/**
 * Assert a specific response type. Throws on error or type mismatch.
 * Consumer types are declared in types/base.d.ts — this is the runtime implementation.
 * @param {unknown} raw
 * @param {string} expectedType
 */
export function assertResponse(raw, expectedType) {
  const result = parseResponse(raw);
  if (isError(result)) throw new Error(/** @type {any} */ (result).error);
  if (/** @type {any} */ (result).type !== expectedType) {
    throw new Error(
      `Expected type "${expectedType}", got "${/** @type {any} */ (result).type}"`,
    );
  }
  return result;
}
