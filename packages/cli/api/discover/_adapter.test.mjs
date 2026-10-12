// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for how the discover adapter calls discover sources: order,
 * failure isolation, timeouts, and the saved copy. Sources are plain functions
 * on a stand-in project, and the saved copies go to a temp directory.
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {callSources} from './_adapter.mjs';

/**
 * @param {string} name
 * @param {object[]} packages
 */
function catalog(name, packages) {
  return {
    schemaVersion: 1,
    source: {name, generatedAt: '2026-09-30T00:00:00.000Z', complete: true},
    packages,
  };
}

/**
 * @param {string} name
 * @param {object} [extra]
 */
function pkg(name, extra = {}) {
  return {
    package: name,
    integration: name,
    aliases: [],
    latest: '1.0.0',
    versions: [
      {version: '1.0.0', publishedAt: null, prerelease: false, status: 'ok'},
    ],
    contributions: [],
    ...extra,
  };
}

/**
 * @param {{config?: object, integrations?: object[]}} parts
 * @returns {any}
 */
function project({config = {}, integrations = []}) {
  return {config, loadedIntegrations: integrations, cwd: '/virtual/project'};
}

let cacheDir;

beforeEach(() => {
  cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), 'discover-cache-'));
});

afterEach(() => {
  fs.rmSync(cacheDir, {recursive: true, force: true});
});

describe('callSources', () => {
  it('asks the project source first, then each integration in load order, once per function', async () => {
    /** @type {string[]} */
    const calls = [];
    const shared = vi.fn(async () => {
      calls.push('shared');
      return catalog('Shared', [pkg('@a/one')]);
    });
    const own = vi.fn(async () => {
      calls.push('own');
      return catalog('Own', [pkg('@a/one', {latest: '9.9.9'}), pkg('@a/two')]);
    });

    const result = await callSources(
      project({
        config: {discover: own},
        integrations: [
          {name: '@x/first', __discover: shared},
          {name: '@x/second', __discover: shared},
        ],
      }),
      {},
      {cacheDir},
    );

    expect(calls).toEqual(['own', 'shared']);
    expect(result.sources.map(s => [s.name, s.from, s.status])).toEqual([
      ['Own', 'astryx.config', 'fresh'],
      ['Shared', '@x/first', 'fresh'],
    ]);
    expect(result.packages.map(p => [p.package, p.latest, p.source])).toEqual([
      ['@a/one', '9.9.9', 'Own'],
      ['@a/two', '1.0.0', 'Own'],
    ]);
  });

  it('passes the package and version it wants, with an abort signal', async () => {
    const source = vi.fn(async () => catalog('S', []));

    await callSources(
      project({integrations: [{name: '@x/src', __discover: source}]}),
      {package: '@a/one', version: '1.0.0'},
      {cacheDir},
    );

    expect(source).toHaveBeenCalledWith({
      signal: expect.any(globalThis.AbortSignal),
      package: '@a/one',
      version: '1.0.0',
    });
  });

  it('keeps every other source when one throws, returns bad data, or is not a function', async () => {
    const result = await callSources(
      project({
        integrations: [
          {
            name: '@x/throws',
            __discover: async () => {
              throw new Error('offline');
            },
          },
          {name: '@x/bad', __discover: async () => ({schemaVersion: 2})},
          {
            name: '@x/broken',
            __discoverError: 'named export "discover" must be a function',
          },
          {
            name: '@x/good',
            __discover: async () => catalog('Good', [pkg('@a/one')]),
          },
        ],
      }),
      {},
      {cacheDir},
    );

    expect(result.sources.map(s => [s.from, s.status])).toEqual([
      ['@x/throws', 'failed'],
      ['@x/bad', 'failed'],
      ['@x/broken', 'failed'],
      ['@x/good', 'fresh'],
    ]);
    expect(result.sources[0].error).toContain('offline');
    expect(result.sources[1].error).toContain('schemaVersion 2');
    expect(result.sources[2].error).toContain('must be a function');
    expect(result.packages.map(p => p.package)).toEqual(['@a/one']);
  });

  it('gives up on a source after the timeout and aborts its signal', async () => {
    /** @type {AbortSignal | undefined} */
    let seen;
    const slow = ({signal}) => {
      seen = signal;
      return new Promise(() => {});
    };

    const result = await callSources(
      project({integrations: [{name: '@x/slow', __discover: slow}]}),
      {},
      {cacheDir, timeoutMs: 20},
    );

    expect(result.sources[0]).toMatchObject({
      status: 'failed',
      error: expect.stringContaining('did not answer'),
    });
    expect(seen?.aborted).toBe(true);
  });

  it('uses the copy saved for the same request when a source fails, and says when it was saved', async () => {
    let online = true;
    const source = async () => {
      if (!online) throw new Error('offline');
      return catalog('S', [pkg('@a/one')]);
    };
    const p = project({integrations: [{name: '@x/src', __discover: source}]});

    await callSources(p, {}, {cacheDir});
    online = false;
    const offline = await callSources(p, {}, {cacheDir});

    expect(offline.sources[0]).toMatchObject({
      name: 'S',
      status: 'saved',
      error: 'offline',
      savedAt: expect.any(String),
    });
    expect(offline.packages.map(x => x.package)).toEqual(['@a/one']);

    const otherRequest = await callSources(p, {package: '@a/one'}, {cacheDir});
    expect(otherRequest.sources[0].status).toBe('failed');
  });

  it('keeps the saved copy in the cache directory, not in the project', async () => {
    await callSources(
      project({
        integrations: [
          {name: '@x/src', __discover: async () => catalog('S', [])},
        ],
      }),
      {},
      {cacheDir},
    );

    expect(fs.readdirSync(path.join(cacheDir, 'discover'))).toHaveLength(1);
    expect(fs.existsSync('/virtual/project')).toBe(false);
  });

  it('returns nothing when there is no project', async () => {
    expect(await callSources(undefined)).toEqual({sources: [], packages: []});
  });
});
