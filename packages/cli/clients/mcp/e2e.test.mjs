// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file End-to-end: drive the REAL `astryx mcp` binary over a pipe.
 *
 * The unit tests inject streams; this one proves the shipped process actually
 * speaks MCP — and, most importantly, that stdout carries protocol lines and
 * NOTHING else. A single stray banner, nudge or warning on stdout would make
 * the server unusable, and only a real spawn can catch that.
 */

import {describe, it, expect} from 'vitest';
import {spawn} from 'node:child_process';
import * as path from 'node:path';

const BIN = path.resolve(import.meta.dirname, '../cli/bin/astryx.mjs');
const REPO_ROOT = path.resolve(import.meta.dirname, '../../../..');

/**
 * Send framed requests to a fresh `astryx mcp` process and collect its stdout.
 * @param {object[]} requests
 * @returns {Promise<{messages: object[], stderr: string, code: number|null, raw: string}>}
 */
function session(requests) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [BIN, 'mcp'], {
      cwd: REPO_ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', d => {
      stdout += d.toString();
    });
    child.stderr.on('data', d => {
      stderr += d.toString();
    });
    child.on('error', reject);
    child.on('close', code => {
      resolve({
        raw: stdout,
        messages: stdout
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => JSON.parse(line)),
        stderr,
        code,
      });
    });

    for (const request of requests) {
      child.stdin.write(`${JSON.stringify(request)}\n`);
    }
    child.stdin.end();
  });
}

const initialize = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: {name: 'test', version: '1'},
  },
};

describe('astryx mcp (real process)', () => {
  it('completes the handshake and reports the installed core version', async () => {
    const {messages, code} = await session([
      initialize,
      {jsonrpc: '2.0', method: 'notifications/initialized'},
    ]);

    expect(code).toBe(0);
    // The notification must NOT produce a second line.
    expect(messages).toHaveLength(1);
    expect(messages[0].result.serverInfo.name).toBe('astryx');
    expect(messages[0].result.capabilities.tools).toBeDefined();
    // Not just the literal "@astryxdesign/core": that appears in the
    // not-installed branch too, so asserting it alone passes either way.
    expect(messages[0].result.instructions).toMatch(
      /@astryxdesign\/core: \d+\.\d+\.\d+.* \(installed\)/,
    );
  }, 30000);

  it('lists exactly search and get', async () => {
    const {messages} = await session([
      initialize,
      {jsonrpc: '2.0', id: 2, method: 'tools/list'},
    ]);
    const listed = messages.find(m => m.id === 2);
    expect(
      listed.result.tools.map((/** @type {{name: string}} */ t) => t.name),
    ).toEqual(['search', 'get']);
  }, 30000);

  it('answers a real tools/call from the project on disk', async () => {
    const {messages} = await session([
      initialize,
      {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {name: 'search', arguments: {query: 'button', limit: 3}},
      },
    ]);
    const called = messages.find(m => m.id === 3);
    expect(called.result.isError).toBeUndefined();
    const payload = JSON.parse(called.result.content[0].text);
    expect(payload.results[0].name).toBe('Button');
  }, 30000);

  // The setup nudge is human guidance printed once per invocation. An MCP
  // server is launched by a client, not a person, so it surfaces as a spurious
  // log line on every session start — and it contradicts the feature itself:
  // serving a project that never ran `astryx init` is the supported case.
  it('says nothing on stderr either', async () => {
    const {stderr} = await session([initialize]);
    expect(stderr.trim()).toBe('');
  }, 30000);

  it('writes protocol lines and nothing else to stdout', async () => {
    const {raw} = await session([
      initialize,
      {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {name: 'get', arguments: {name: 'Button'}},
      },
    ]);
    for (const line of raw.split('\n').filter(l => l.trim() !== '')) {
      expect(() => JSON.parse(line)).not.toThrow();
      expect(JSON.parse(line).jsonrpc).toBe('2.0');
    }
  }, 30000);
});
