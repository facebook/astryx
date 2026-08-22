// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the JSON-RPC 2.0 framing the MCP stdio client speaks.
 *
 * The transport is the contract: MCP over stdio is newline-delimited JSON-RPC
 * on stdin/stdout. These tests pin the three rules that a hand-written
 * transport is most likely to get wrong — notifications never get a reply, a
 * reply always echoes its request id, and a malformed line becomes a parse
 * error rather than a crash.
 */

import {describe, it, expect} from 'vitest';
import {
  INVALID_REQUEST,
  PARSE_ERROR,
  decodeLine,
  encodeMessage,
  errorResponse,
} from './protocol.mjs';

describe('decodeLine', () => {
  it('parses a framed request into a message object', () => {
    expect(decodeLine('{"jsonrpc":"2.0","id":1,"method":"ping"}')).toEqual({
      ok: true,
      message: {jsonrpc: '2.0', id: 1, method: 'ping'},
    });
  });

  it('reports a parse error for a malformed line instead of throwing', () => {
    const result = decodeLine('{not json');
    expect(result.ok).toBe(false);
    expect(result.code).toBe(-32700);
  });

  it('ignores a blank line', () => {
    expect(decodeLine('   ')).toEqual({ok: false, code: null});
  });

  it('rejects a top-level primitive as an invalid request', () => {
    for (const line of ['42', '"ping"', 'null', 'true']) {
      expect(decodeLine(line)).toEqual({ok: false, code: INVALID_REQUEST});
    }
  });
});

describe('encodeMessage', () => {
  it('terminates each message with exactly one newline', () => {
    const line = encodeMessage({jsonrpc: '2.0', id: 1, result: {}});
    expect(line.endsWith('\n')).toBe(true);
    expect(line.slice(0, -1)).not.toContain('\n');
  });
});

describe('errorResponse', () => {
  it('echoes the request id and carries the JSON-RPC error code', () => {
    expect(errorResponse(7, -32601, 'Method not found')).toEqual({
      jsonrpc: '2.0',
      id: 7,
      error: {code: -32601, message: 'Method not found'},
    });
  });

  // JSON-RPC 2.0 answers an unparseable request with id: null, but MCP's own
  // schema rejects a null id, so a compliant client discards the whole frame.
  // Omitting the key validates and still reports the failure.
  it('omits the id entirely when the request id is unknowable', () => {
    const response = errorResponse(null, PARSE_ERROR, 'Parse error');
    expect('id' in response).toBe(false);
    expect(response.error.code).toBe(PARSE_ERROR);
  });
});

describe('decodeLine — JSON-RPC batches', () => {
  // MCP 2024-11-05 and 2025-03-26 require batch support; 2025-06-18 removed it.
  // This server advertises all three, so it has to accept arrays.
  it('recognises an array payload as a batch rather than rejecting it', () => {
    const result = decodeLine(
      '[{"jsonrpc":"2.0","id":1,"method":"ping"},{"jsonrpc":"2.0","id":2,"method":"ping"}]',
    );
    expect(result.ok).toBe(true);
    expect(result.batch).toHaveLength(2);
  });

  it('rejects an empty batch as an invalid request', () => {
    expect(decodeLine('[]')).toEqual({ok: false, code: INVALID_REQUEST});
  });
});
