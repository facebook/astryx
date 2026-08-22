// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The stdio pump: newline-delimited JSON-RPC in, responses out.
 *
 * stdout is the protocol channel, so nothing else may ever be written to it.
 * That holds by construction here: `api/` functions return values rather than
 * printing, and the CLI's shared `logger` is silent unless a client enables it
 * (`api/logger.mjs`) — which `astryx mcp` never does. Diagnostics go to stderr.
 *
 * Requests are handled one at a time so responses keep wire order.
 *
 * @input a readable stream of newline-delimited JSON-RPC
 * @output framed responses on a writable stream
 * @position packages/cli/clients/mcp — transport driver, under the handler
 */

import {
  INTERNAL_ERROR,
  INVALID_REQUEST,
  decodeLine,
  encodeMessage,
  errorResponse,
} from './protocol.mjs';

/**
 * Drive one MCP session to completion. Resolves when the input stream ends.
 *
 * @param {object} options
 * @param {NodeJS.ReadableStream} options.input
 * @param {NodeJS.WritableStream} options.output
 * @param {(message: Record<string, unknown>) => Promise<object|null>} options.handle
 * @returns {Promise<void>}
 */
export async function pump({input, output, handle}) {
  /** @param {object} message */
  const write = message => output.write(encodeMessage(message));

  /** @param {string} line */
  async function processLine(line) {
    const decoded = decodeLine(line);

    if (!decoded.ok) {
      // A blank line carries no code and needs no answer.
      if (decoded.code === null) return;
      const label =
        decoded.code === INVALID_REQUEST ? 'Invalid request' : 'Parse error';
      write(errorResponse(null, decoded.code, label));
      return;
    }

    // A batch is answered with ONE array holding the responses its answerable
    // members produced; an all-notification batch is answered with nothing.
    if ('batch' in decoded) {
      /** @type {object[]} */
      const responses = [];
      for (const message of decoded.batch) {
        const response = await answer(message);
        if (response) responses.push(response);
      }
      if (responses.length > 0) write(responses);
      return;
    }

    const response = await answer(decoded.message);
    if (response) write(response);
  }

  /**
   * Run one message through the handler, turning a fault into an error response
   * rather than letting it end the session.
   * @param {unknown} message
   * @returns {Promise<object|null>}
   */
  async function answer(message) {
    // decodeLine screens a single message, but batch members arrive here raw:
    // a null or primitive member must answer as an invalid request, not reach
    // the handler (where reading .id off null would end the session).
    if (message === null || typeof message !== 'object' || Array.isArray(message)) {
      return errorResponse(null, INVALID_REQUEST, 'Invalid request');
    }
    const request = /** @type {Record<string, unknown>} */ (message);
    try {
      return await handle(request);
    } catch (err) {
      const id = /** @type {string|number|null} */ (request.id ?? null);
      const detail = err instanceof Error ? err.message : String(err);
      return errorResponse(id, INTERNAL_ERROR, detail);
    }
  }

  input.setEncoding('utf8');

  let buffer = '';
  for await (const chunk of input) {
    buffer += chunk;
    let newline = buffer.indexOf('\n');
    while (newline !== -1) {
      const line = buffer.slice(0, newline);
      buffer = buffer.slice(newline + 1);
      await processLine(line);
      newline = buffer.indexOf('\n');
    }
  }

  // A final line with no trailing newline is still a message.
  if (buffer.trim() !== '') await processLine(buffer);
}
