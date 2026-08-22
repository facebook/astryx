// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for the `search` leaf (api/search/search.mjs), run
 * against the real @astryxdesign/core registry. `search` had no api-level tests;
 * this locks the envelope, ranking invariants, the `--type`/limit handling, and
 * the error paths.
 *
 * The API validates its own inputs (not just the CLI): a non-positive/non-integer
 * `limit`, an empty query, and a bad `--type` all throw AstryxError with the
 * ERR_INVALID_ARGUMENT code, so a direct `@astryxdesign/cli/api` caller gets the
 * same contract as `astryx search` on the command line.
 */

import {describe, it, expect} from 'vitest';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {search, scoreCandidate, SEARCH_DOMAINS} from './search.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const cwd = REPO;
const SLOW = 30_000;

describe('search leaf — envelope + ranking', () => {
  it('returns a `search` envelope with query + results', async () => {
    const r = await search('button', {cwd});
    expect(r.type).toBe('search');
    expect(r.data.query).toBe('button');
    expect(Array.isArray(r.data.results)).toBe(true);
    expect(r.data.results.length).toBeGreaterThan(0);
  }, SLOW);

  it('returns an empty result set (not an error) for a no-match query', async () => {
    const r = await search('zzznomatch99', {cwd});
    expect(r.type).toBe('search');
    expect(r.data.results).toEqual([]);
  }, SLOW);

  it('defaults to at most 20 results', async () => {
    const r = await search('button', {cwd});
    expect(r.data.results.length).toBeLessThanOrEqual(20);
  }, SLOW);

  it('caps results to a positive limit', async () => {
    const r = await search('button', {cwd, limit: 2});
    expect(r.data.results.length).toBeLessThanOrEqual(2);
  }, SLOW);
});

describe('search leaf — --type filter', () => {
  it('restricts results to the requested domain', async () => {
    const r = await search('button', {cwd, type: 'component'});
    expect(r.data.results.every(x => x.domain === 'component')).toBe(true);
  }, SLOW);

  it('exposes the valid domain list', () => {
    expect(SEARCH_DOMAINS).toEqual(expect.arrayContaining(['component', 'hook', 'doc', 'template']));
  });
});

describe('search leaf — error paths (pinned)', () => {
  it('throws ERR_INVALID_ARGUMENT when the query is empty/whitespace', async () => {
    await expect(search('   ', {cwd})).rejects.toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
      message: expect.stringMatching(/query is required/i),
    });
  }, SLOW);

  it('throws ERR_INVALID_ARGUMENT for an unknown --type', async () => {
    await expect(
      search('button', {cwd, type: /** @type {any} */ ('bogus')}),
    ).rejects.toMatchObject({code: 'ERR_INVALID_ARGUMENT'});
  }, SLOW);
});

describe('search leaf — limit validation (API matches the CLI contract)', () => {
  it('throws ERR_INVALID_ARGUMENT for a limit of 0 (no longer returns everything)', async () => {
    await expect(search('button', {cwd, limit: 0})).rejects.toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
    });
  }, SLOW);

  it('throws ERR_INVALID_ARGUMENT for a negative limit', async () => {
    await expect(search('button', {cwd, limit: -5})).rejects.toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
    });
  }, SLOW);

  it('throws ERR_INVALID_ARGUMENT for a non-integer limit', async () => {
    await expect(search('button', {cwd, limit: 2.5})).rejects.toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
    });
  }, SLOW);
});

/**
 * A page template's keywords are auto-derived from the component names it
 * renders. Scored at the same weight as an authored keyword, that signal
 * drowns out intent: every page that renders a `<List>` anywhere claimed the
 * same "list" match as the page that IS a list, so the ranking flattened into
 * a tie and fell through to the alphabetical tiebreak.
 */
describe('search leaf — page ranking is not dominated by incidental renders', () => {
  /**
   * @param {Awaited<ReturnType<typeof search>>} r
   * @returns {Array<{name: string, score: number, reason: string}>} pages, in rank order
   */
  const pagesOf = r => /** @type {any[]} */ (r.data.results).filter(x => x.kind === 'page');

  it('ranks a table page top-3 for "customer list", not the pages that merely render a List', async () => {
    const pages = pagesOf(await search('customer list', {cwd, type: 'template', limit: 400}));
    const top = pages.slice(0, 3).map(p => p.name);
    expect(top).toEqual(expect.arrayContaining([expect.stringMatching(/^table/)]));
  }, SLOW);

  it('keeps the widest-surface page off the top spot for a query it only brushes', async () => {
    // theme-showcase renders ~51 components — 4x the median page — so it used
    // to match more tokens of almost any query than the page actually about them.
    const pages = pagesOf(await search('list of users', {cwd, type: 'template', limit: 400}));
    expect(pages.length).toBeGreaterThan(0);
    expect(pages[0].name).not.toBe('theme-showcase');
  }, SLOW);

  it('separates pages by score instead of collapsing into one alphabetical tie', async () => {
    const pages = pagesOf(await search('customer list', {cwd, type: 'template', limit: 400}));
    expect(pages.length).toBeGreaterThan(5);
    expect(pages[0].score).toBeGreaterThan(pages[5].score);
  }, SLOW);
});

describe('scoreCandidate() — derived vs authored keywords', () => {
  it('scores an authored keyword above the same word derived from the source', () => {
    const authored = scoreCandidate('list', {name: 'x', keywords: ['List']});
    const derived = scoreCandidate('list', {name: 'x', derivedKeywords: ['List']});
    expect(authored.score).toBeGreaterThan(derived.score);
  });

  it('scores a derived keyword lower as the page renders more components', () => {
    const focused = scoreCandidate('list', {name: 'x', derivedKeywords: ['List', 'Card']});
    const sprawling = scoreCandidate('list', {
      name: 'x',
      derivedKeywords: ['List', ...Array.from({length: 50}, (_, i) => `C${i}`)],
    });
    expect(focused.score).toBeGreaterThan(sprawling.score);
  });

  it('still reports a derived hit rather than dropping it', () => {
    const hit = scoreCandidate('kanban', {name: 'x', derivedKeywords: ['Kanban', 'Card']});
    expect(hit).not.toBeNull();
    expect(hit.score).toBeGreaterThan(0);
  });
});
