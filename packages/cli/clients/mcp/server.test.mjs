// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the MCP request handler.
 *
 * The tool layer is injected here so these tests pin the PROTOCOL contract —
 * handshake, notification silence, tool listing, and the MCP rule that a tool
 * failure is a successful response carrying `isError`, not a JSON-RPC error.
 * The real tools are exercised in tools.test.mjs.
 */

import {describe, it, expect} from 'vitest';
import {
  DEFAULT_PROTOCOL_VERSION,
  SUPPORTED_PROTOCOL_VERSIONS,
  createHandler,
} from './server.mjs';

/** A stand-in tool set: one tool that succeeds, one that throws. */
const fakeTools = [
  {
    name: 'search',
    description: 'fake search',
    inputSchema: {type: 'object', properties: {query: {type: 'string'}}},
    run: async (/** @type {{query: string}} */ args) => ({hit: args.query}),
  },
  {
    name: 'get',
    description: 'fake get',
    inputSchema: {type: 'object', properties: {name: {type: 'string'}}},
    run: async () => {
      throw new Error('boom');
    },
  },
];

const handler = () => createHandler({tools: fakeTools});

describe('initialize', () => {
  it('reports tool capability and identifies the server as astryx', async () => {
    const response = await handler().handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {protocolVersion: '2025-06-18'},
    });
    expect(response?.result?.capabilities?.tools).toBeDefined();
    expect(response?.result?.serverInfo?.name).toBe('astryx');
  });

  it('carries the project instructions so the model sees them once per session', async () => {
    const handler = createHandler({
      tools: fakeTools,
      instructions: 'core 9.9.9 installed here',
    });
    const response = await handler.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {},
    });
    expect(response?.result?.instructions).toBe('core 9.9.9 installed here');
  });

  it('omits instructions entirely when there are none', async () => {
    const response = await handler().handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {},
    });
    expect('instructions' in (response?.result ?? {})).toBe(false);
  });

  // Without this, the fallback branch is never exercised: every other test
  // asks for a version the server already knows, so replacing the fallback
  // with the requested value would survive the whole suite.
  it('offers its own newest revision when asked for one it does not know', async () => {
    const response = await handler().handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {protocolVersion: '1999-01-01'},
    });
    expect(response?.result?.protocolVersion).toBe(DEFAULT_PROTOCOL_VERSION);
    expect(SUPPORTED_PROTOCOL_VERSIONS).toContain(
      response?.result?.protocolVersion,
    );
  });

  it('echoes a protocol version the client asked for', async () => {
    const response = await handler().handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {protocolVersion: '2024-11-05'},
    });
    expect(response?.result?.protocolVersion).toBe('2024-11-05');
  });
});

describe('notifications', () => {
  it('never answers a message without an id', async () => {
    const response = await handler().handle({
      jsonrpc: '2.0',
      method: 'notifications/initialized',
    });
    expect(response).toBeNull();
  });

  it('answers a request whose id is the number zero', async () => {
    const response = await handler().handle({
      jsonrpc: '2.0',
      id: 0,
      method: 'ping',
    });
    expect(response?.id).toBe(0);
  });
});

describe('tools/list', () => {
  it('lists every injected tool with its name, description and schema', async () => {
    const response = await handler().handle({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
    });
    const tools = response?.result?.tools ?? [];
    expect(tools.map((/** @type {{name: string}} */ t) => t.name)).toEqual([
      'search',
      'get',
    ]);
    expect(tools[0].inputSchema).toEqual({
      type: 'object',
      properties: {query: {type: 'string'}},
    });
  });
});

describe('tools/call', () => {
  it('returns the tool result as MCP text content', async () => {
    const response = await handler().handle({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {name: 'search', arguments: {query: 'button'}},
    });
    const content = response?.result?.content ?? [];
    expect(content[0].type).toBe('text');
    expect(JSON.parse(content[0].text)).toEqual({hit: 'button'});
  });

  it('reports a throwing tool as isError, not as a JSON-RPC error', async () => {
    const response = await handler().handle({
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {name: 'get', arguments: {name: 'Nope'}},
    });
    expect(response?.error).toBeUndefined();
    expect(response?.result?.isError).toBe(true);
    expect(response?.result?.content?.[0]?.text).toContain('boom');
  });

  it('rejects an unknown tool name with a JSON-RPC invalid-params error', async () => {
    const response = await handler().handle({
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {name: 'nope', arguments: {}},
    });
    expect(response?.error?.code).toBe(-32602);
  });
});

describe('malformed requests', () => {
  it('answers invalid-request when the method is missing or not a string', async () => {
    const missing = await handler().handle({jsonrpc: '2.0', id: 7});
    expect(missing?.error?.code).toBe(-32600);
    const wrong = await handler().handle({jsonrpc: '2.0', id: 8, method: 5});
    expect(wrong?.error?.code).toBe(-32600);
    expect(wrong?.id).toBe(8);
  });
});

describe('unknown methods', () => {
  it('answers method-not-found rather than staying silent', async () => {
    const response = await handler().handle({
      jsonrpc: '2.0',
      id: 6,
      method: 'resources/list',
    });
    expect(response?.error?.code).toBe(-32601);
  });
});
