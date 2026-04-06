/**
 * @file Internal JSON output helpers for CLI commands.
 *
 * Commands call jsonOut(type, data) for success and jsonError(msg) for errors.
 * Both set process.__xdsJsonHandled so the global fallback hook knows
 * the command handled --json itself.
 *
 * Consumer-facing utilities (parseResponse, isError, assertResponse)
 * live in parse.mjs and are exported via @xds/cli/json.
 */

/**
 * Output a typed JSON response envelope and mark as handled.
 * @param {import('../types/base').CLIResponseType} type
 * @param {unknown} data
 * @returns {void}
 */
export function jsonOut(type, data) {
  process.__xdsJsonHandled = true;
  console.log(JSON.stringify({type, data}, null, 2));
}

/**
 * Output a structured JSON error and exit.
 * @param {string} message
 * @param {Array<{name: string, reason: string}>} [suggestions]
 */
export function jsonError(message, suggestions) {
  process.__xdsJsonHandled = true;
  /** @type {import('../types/base').CLIError} */
  const err = {error: message};
  if (suggestions?.length) err.suggestions = suggestions;
  console.log(JSON.stringify(err, null, 2));
  process.exit(1);
}
