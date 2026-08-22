// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the stdio pump.
 *
 * stdout is the protocol channel: one JSON-RPC message per line and nothing
 * else. Anything that prints to stdout corrupts the session, so these tests pin
 * that notifications stay silent, that a message split across chunk boundaries
 * still parses, and that a malformed line answers with a parse error instead of
 * killing the process.
 */

import {describe, it, expect} from 'vitest';
import {PassThrough} from 'node:stream';
import {pump} from './stdio.mjs';

/**
 * Feed lines through the pump and collect everything written to stdout.
 * @param {string[]} chunks raw stdin chunks (not necessarily whole lines)
 * @param {(message: Record<string, unknown>) => Promise<object|null>} handle
 * @returns {Promise<object[]>}
 */
async function run(chunks, handle) {
  const input = new PassThrough();
  const output = new PassThrough();
  /** @type {string} */
  let written = '';
  output.on('data', d => {
    written += d.toString();
  });

  const done = pump({input, output, handle});
  for (const chunk of chunks) input.write(chunk);
  input.end();
  await done;

  return written
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => JSON.parse(line));
}

const echo = async (/** @type {Record<string, unknown>} */ message) =>
  message.id === undefined
    ? null
    : {jsonrpc: '2.0', id: message.id, result: {}};

describe('pump', () => {
  it('answers one request with one line', async () => {
    const out = await run(['{"jsonrpc":"2.0","id":1,"method":"ping"}\n'], echo);
    expect(out).toEqual([{jsonrpc: '2.0', id: 1, result: {}}]);
  });

  it('stays silent for a notification', async () => {
    const out = await run(
      ['{"jsonrpc":"2.0","method":"notifications/initialized"}\n'],
      echo,
    );
    expect(out).toEqual([]);
  });

  it('reassembles a message split across chunks', async () => {
    const out = await run(
      ['{"jsonrpc":"2.0","id', '":2,"method":"ping"}\n'],
      echo,
    );
    expect(out).toEqual([{jsonrpc: '2.0', id: 2, result: {}}]);
  });

  it('handles several messages arriving in one chunk', async () => {
    const out = await run(
      [
        '{"jsonrpc":"2.0","id":1,"method":"ping"}\n{"jsonrpc":"2.0","id":2,"method":"ping"}\n',
      ],
      echo,
    );
    expect(out.map(m => m.id)).toEqual([1, 2]);
  });

  it('answers a malformed line with a parse error and keeps serving', async () => {
    const out = await run(
      ['{not json\n', '{"jsonrpc":"2.0","id":3,"method":"ping"}\n'],
      echo,
    );
    expect(out[0].error.code).toBe(-32700);
    expect(out[1].id).toBe(3);
  });

  it('answers a top-level primitive line as an invalid request', async () => {
    const out = await run(['null\n'], echo);
    expect(out).toEqual([
      {jsonrpc: '2.0', error: {code: -32600, message: 'Invalid request'}},
    ]);
  });

  it('ignores blank lines between messages', async () => {
    const out = await run(
      ['\n  \n{"jsonrpc":"2.0","id":12,"method":"ping"}\n'],
      echo,
    );
    expect(out).toEqual([{jsonrpc: '2.0', id: 12, result: {}}]);
  });

  it('accepts CRLF line endings', async () => {
    const out = await run(['{"jsonrpc":"2.0","id":13,"method":"ping"}\r\n'], echo);
    expect(out).toEqual([{jsonrpc: '2.0', id: 13, result: {}}]);
  });

  // The comment in pump() promises this; without a test the branch is free to
  // rot: a client may end its stream without a final newline.
  it('answers a final message that arrives with no trailing newline', async () => {
    const out = await run(['{"jsonrpc":"2.0","id":11,"method":"ping"}'], echo);
    expect(out).toEqual([{jsonrpc: '2.0', id: 11, result: {}}]);
  });

  it('turns a handler crash into an internal error instead of dying', async () => {
    const out = await run(
      ['{"jsonrpc":"2.0","id":4,"method":"ping"}\n'],
      async () => {
        throw new Error('handler exploded');
      },
    );
    expect(out[0].error.code).toBe(-32603);
    expect(out[0].id).toBe(4);
  });

  it('answers a batch with one array carrying every answerable response', async () => {
    const out = await run(
      [
        '[{"jsonrpc":"2.0","id":1,"method":"ping"},' +
          '{"jsonrpc":"2.0","method":"notifications/initialized"},' +
          '{"jsonrpc":"2.0","id":2,"method":"ping"}]\n',
      ],
      echo,
    );
    // One wire message, which is itself the array of the two answerable ids.
    expect(out).toHaveLength(1);
    expect(out[0].map((/** @type {{id: number}} */ m) => m.id)).toEqual([1, 2]);
  });

  it('stays silent for a batch made only of notifications', async () => {
    const out = await run(
      ['[{"jsonrpc":"2.0","method":"a"},{"jsonrpc":"2.0","method":"b"}]\n'],
      echo,
    );
    expect(out).toEqual([]);
  });

  // decodeLine screens a single message, but batch members arrive raw. A
  // member like null or 1 must answer as an invalid request inside the batch
  // reply — not crash the session, and not vanish.
  it('answers non-object batch members with invalid-request errors and keeps serving', async () => {
    const out = await run(
      [
        '[null,1,{"jsonrpc":"2.0","id":9,"method":"ping"}]\n',
        '{"jsonrpc":"2.0","id":10,"method":"ping"}\n',
      ],
      echo,
    );
    expect(out).toHaveLength(2);
    const batch = out[0];
    expect(batch).toHaveLength(3);
    expect(batch[0].error.code).toBe(-32600);
    expect('id' in batch[0]).toBe(false);
    expect(batch[1].error.code).toBe(-32600);
    expect(batch[2]).toEqual({jsonrpc: '2.0', id: 9, result: {}});
    expect(out[1].id).toBe(10);
  });

  // Responses must leave in request order. Without awaiting each handler the
  // pump would interleave, so a slow first request would answer after a fast
  // second one and a client pairing by arrival would mismatch them.
  it('keeps responses in request order even when the first is slower', async () => {
    /** @param {Record<string, unknown>} message */
    const slowFirst = async message => {
      if (message.id === 1) await new Promise(r => setTimeout(r, 25));
      return {jsonrpc: '2.0', id: message.id, result: {}};
    };
    const out = await run(
      [
        '{"jsonrpc":"2.0","id":1,"method":"ping"}\n' +
          '{"jsonrpc":"2.0","id":2,"method":"ping"}\n',
      ],
      slowFirst,
    );
    expect(out.map(m => m.id)).toEqual([1, 2]);
  });
});
