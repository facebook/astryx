// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file JSON-RPC 2.0 framing for the MCP stdio transport.
 *
 * MCP over stdio is newline-delimited JSON-RPC 2.0: one JSON object per line on
 * stdin, one per line on stdout. That is the whole transport, so it is written
 * here rather than taken as a dependency — `@modelcontextprotocol/sdk` carries
 * express, hono, cors, jose and ajv to serve HTTP and OAuth, none of which a
 * stdio server speaks, and `@astryxdesign/cli` is published (every consumer
 * would inherit them).
 *
 * @input newline-delimited JSON-RPC text from stdin
 * @output framed JSON-RPC message objects, and encoded lines for stdout
 * @position packages/cli/clients/mcp — transport layer, below the tool layer
 */

/** JSON-RPC 2.0 reserved error codes used by this transport. */
export const PARSE_ERROR = -32700;
export const INVALID_REQUEST = -32600;
export const METHOD_NOT_FOUND = -32601;
export const INTERNAL_ERROR = -32603;

/**
 * The outcome of reading one line off the wire. A blank line is not an error —
 * it carries `code: null` so the caller stays silent rather than replying. An
 * array payload is a JSON-RPC batch and arrives as `batch`.
 * @typedef {{ok: true, message: Record<string, unknown>} | {ok: true, batch: Record<string, unknown>[]} | {ok: false, code: number|null}} DecodedLine
 */

/**
 * Decode one newline-delimited JSON-RPC line.
 * @param {string} line
 * @returns {DecodedLine}
 */
export function decodeLine(line) {
  const trimmed = line.trim();
  if (trimmed === '') return {ok: false, code: null};

  /** @type {unknown} */
  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return {ok: false, code: PARSE_ERROR};
  }

  // A JSON-RPC batch arrives as an array. MCP 2024-11-05 and 2025-03-26 both
  // require batch support (2025-06-18 removed it again), and this server
  // advertises all three, so an array is answered rather than rejected.
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return {ok: false, code: INVALID_REQUEST};
    return {ok: true, batch: /** @type {Record<string, unknown>[]} */ (parsed)};
  }

  if (parsed === null || typeof parsed !== 'object') {
    return {ok: false, code: INVALID_REQUEST};
  }
  return {ok: true, message: /** @type {Record<string, unknown>} */ (parsed)};
}

/**
 * Encode one message for stdout. Exactly one trailing newline, and none inside
 * — a stray newline would split one message into two on the wire.
 * @param {object} message
 * @returns {string}
 */
export function encodeMessage(message) {
  return `${JSON.stringify(message)}\n`;
}

/**
 * A JSON-RPC error response echoing the request id.
 *
 * When the id is unknowable (an unparseable line), the key is OMITTED rather
 * than set to null. JSON-RPC 2.0 prescribes null, but MCP's own schema types
 * the id as string|number with no null member, so a compliant client rejects
 * the whole frame and learns nothing. Omitting it validates and still reports.
 *
 * @param {string|number|null} id
 * @param {number} code
 * @param {string} message
 */
export function errorResponse(id, code, message) {
  return id === null || id === undefined
    ? {jsonrpc: '2.0', error: {code, message}}
    : {jsonrpc: '2.0', id, error: {code, message}};
}
