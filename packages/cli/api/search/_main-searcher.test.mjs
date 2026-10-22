// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the main searcher (_main-searcher.mjs) through search():
 * it ranks by plain signals, answers the same every time, never grows the
 * response past the lexical ranker's, and touches no network. Run against the
 * real @astryxdesign/core.
 */

import {describe, it, expect, vi, afterEach} from 'vitest';
import * as path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import {fileURLToPath} from 'node:url';
import {search, searchCore} from './search.mjs';

const REPO = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../..',
);
const QUERIES = [
  'date chooser',
  'show a confirmation before deleting',
  'toast notice for a saved draft',
  'grid of rows you can sort by column',
  'how do I switch to dark mode',
  'page of settings with a side menu',
  'Bookmarkz',
  'qzxv',
];
/** @param {unknown} r */
const top = r =>
  /** @type {any} */ (r).data.results.map(x => `${x.domain}:${x.name}`);

afterEach(() => vi.restoreAllMocks());

describe('main searcher', () => {
  it('finds a component from what it does', async () => {
    expect(
      top(await search('show a confirmation before deleting', {cwd: REPO}))[0],
    ).toBe('component:AlertDialog');
    expect(top(await search('date chooser', {cwd: REPO}))[0]).toBe(
      'component:DateInput',
    );
  });

  it('answers a whole-name query exactly as the lexical ranker does', async () => {
    for (const q of ['Button', 'Dialog', 'useTheme', 'tokens']) {
      expect(top(await search(q, {cwd: REPO}))).toEqual(
        top(await searchCore(q, {cwd: REPO})),
      );
    }
  });

  it('answers a name typed with spaces for its dashes as the lexical ranker does', async () => {
    for (const q of ['author a theme', 'all tokens']) {
      expect(top(await search(q, {cwd: REPO}))).toEqual(
        top(await searchCore(q, {cwd: REPO})),
      );
    }
  });

  it('answers the same every time', async () => {
    for (const q of QUERIES.slice(0, 3)) {
      expect(top(await search(q, {cwd: REPO}))).toEqual(
        top(await search(q, {cwd: REPO})),
      );
    }
  });

  it(
    'never returns more results than the lexical ranker',
    {timeout: 120_000},
    async () => {
      // The count is the bound: a routed searcher may pick a different, longer
      // candidate for the last places, so the byte total moves with doc text.
      for (const q of QUERIES) {
        const [a, b] = [
          await search(q, {cwd: REPO}),
          await searchCore(q, {cwd: REPO}),
        ];
        expect(a.data.results.length).toBeLessThanOrEqual(
          b.data.results.length,
        );
      }
    },
  );

  it('touches no network', async () => {
    const fail = () => {
      throw new Error('search reached the network');
    };
    vi.spyOn(http, 'request').mockImplementation(fail);
    vi.spyOn(https, 'request').mockImplementation(fail);
    vi.spyOn(net, 'connect').mockImplementation(fail);
    vi.spyOn(net.Socket.prototype, 'connect').mockImplementation(fail);
    vi.spyOn(globalThis, 'fetch').mockImplementation(fail);
    expect(
      top(await search('toast notice for a saved draft', {cwd: REPO}))[0],
    ).toBe('component:Toast');
  });
});
