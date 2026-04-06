/**
 * @file Consumer utilities for parsing XDS CLI JSON output.
 *
 * Exported via `@xds/cli/json`:
 *   import { parseResponse, isError, assertResponse } from '@xds/cli/json';
 */

/**
 * Parse raw CLI output into a typed result.
 * @param {unknown} raw - JSON string or already-parsed object
 * @returns {import('../types/base').CLIAnyResponse | import('../types/base').CLIError | import('../types/base').CLIUnsupportedError}
 */
export function parseResponse(raw) {
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

/**
 * Type guard: returns true if result is a CLI error.
 * @param {unknown} result
 * @returns {result is import('../types/base').CLIError | import('../types/base').CLIUnsupportedError}
 */
export function isError(result) {
  return result != null && typeof result === 'object' && 'error' in result;
}

/**
 * Assert a specific response type. Throws on error or type mismatch.
 * @template {import('../types/base').CLIResponseType} T
 * @param {unknown} raw - JSON string or already-parsed object
 * @param {T} expectedType - The type discriminator to assert
 * @returns {Extract<import('../types/base').CLIAnyResponse, { type: T }>}
 */
export function assertResponse(raw, expectedType) {
  const result = parseResponse(raw);
  if (isError(result)) throw new Error(result.error);
  if (result.type !== expectedType) {
    throw new Error(
      `Expected type "${expectedType}", got "${result.type}"`,
    );
  }
  return result;
}
