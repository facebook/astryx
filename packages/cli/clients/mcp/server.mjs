// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MCP request handler — the method table above the JSON-RPC transport.
 *
 * The tool set is injected so the protocol can be tested without touching the
 * filesystem, and so `astryx mcp` can bind the project-aware tools at startup.
 *
 * Two MCP rules are easy to get wrong and are pinned by tests:
 *   1. A notification (no `id`) is never answered — replying to one is a
 *      protocol violation that wedges strict clients.
 *   2. A tool that FAILS still returns a successful JSON-RPC result carrying
 *      `isError: true`. JSON-RPC errors are reserved for protocol faults
 *      (unknown method, bad params), so a model can read a tool failure as
 *      content and retry rather than treating the session as broken.
 *
 * @input framed JSON-RPC message objects
 * @output JSON-RPC response objects, or null for notifications
 * @position packages/cli/clients/mcp — protocol layer, above transport
 */

import {INVALID_REQUEST, METHOD_NOT_FOUND, errorResponse} from './protocol.mjs';

/** JSON-RPC reserved code for a well-formed call with bad arguments. */
const INVALID_PARAMS = -32602;

/**
 * MCP revisions this server implements. The handshake echoes the client's
 * choice when it is one of these, so an older client is not forced to upgrade.
 */
export const SUPPORTED_PROTOCOL_VERSIONS = [
  '2025-06-18',
  '2025-03-26',
  '2024-11-05',
];

/** The revision offered when the client asks for one we do not know. */
export const DEFAULT_PROTOCOL_VERSION = SUPPORTED_PROTOCOL_VERSIONS[0];

/**
 * One MCP tool: its advertised schema plus the function behind it.
 * @typedef {object} McpTool
 * @property {string} name
 * @property {string} description
 * @property {object} inputSchema JSON Schema for the tool's arguments.
 * @property {(args: Record<string, unknown>) => Promise<unknown>} run
 */

/**
 * A JSON-RPC notification carries no `id` and must never be answered. A request
 * may legitimately use `id: 0`, so test for presence, not truthiness.
 * @param {Record<string, unknown>} message
 * @returns {boolean}
 */
export function isNotification(message) {
  return message.id === undefined || message.id === null;
}

/**
 * Wrap a value as MCP text content. MCP has no structured result type for
 * tools, so payloads travel as pretty-printed JSON in a text block.
 * @param {unknown} value
 * @param {boolean} [isError]
 */
function textContent(value, isError = false) {
  const text =
    typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return isError
    ? {content: [{type: 'text', text}], isError: true}
    : {content: [{type: 'text', text}]};
}

/**
 * Build the request handler.
 * @param {{tools: McpTool[], version?: string, instructions?: string}} options
 */
export function createHandler({tools, version = '0.0.0', instructions}) {
  const byName = new Map(tools.map(tool => [tool.name, tool]));

  /**
   * @param {Record<string, unknown>} message
   * @returns {Promise<Record<string, any>|null>}
   */
  async function handle(message) {
    if (isNotification(message)) return null;

    const id = /** @type {string|number} */ (message.id);
    const method = message.method;
    if (typeof method !== 'string') {
      return errorResponse(id, INVALID_REQUEST, 'Missing method');
    }

    const params = /** @type {Record<string, any>} */ (message.params ?? {});

    switch (method) {
      case 'initialize': {
        const asked = params.protocolVersion;
        const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(asked)
          ? asked
          : DEFAULT_PROTOCOL_VERSION;
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion,
            capabilities: {tools: {}},
            serverInfo: {name: 'astryx', version},
            // Optional per spec; omitted rather than sent empty so a client
            // never shows the model a blank preamble.
            ...(instructions ? {instructions} : {}),
          },
        };
      }

      case 'ping':
        return {jsonrpc: '2.0', id, result: {}};

      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            tools: tools.map(({name, description, inputSchema}) => ({
              name,
              description,
              inputSchema,
            })),
          },
        };

      case 'tools/call': {
        const tool = byName.get(params.name);
        if (!tool) {
          return errorResponse(
            id,
            INVALID_PARAMS,
            `Unknown tool: ${String(params.name)}`,
          );
        }
        try {
          const result = await tool.run(params.arguments ?? {});
          return {jsonrpc: '2.0', id, result: textContent(result)};
        } catch (err) {
          // A tool failure is content, not a protocol fault — the model should
          // read the message and try something else.
          const detail = err instanceof Error ? err.message : String(err);
          return {jsonrpc: '2.0', id, result: textContent(detail, true)};
        }
      }

      default:
        return errorResponse(id, METHOD_NOT_FOUND, `Unknown method: ${method}`);
    }
  }

  return {handle};
}
