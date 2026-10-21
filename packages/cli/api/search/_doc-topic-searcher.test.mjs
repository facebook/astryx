// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The doc-topic branch: a query that names a doc topic answers with the
 * topic and its own sections ahead of entries of another kind that only
 * mention the word, and changes nothing else.
 */

import {describe, it, expect} from 'vitest';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {search, searchCore} from './search.mjs';
import {runTree} from '../../foundation/route/route.mjs';
import {gatherCandidates, loadSearchData} from './_adapter.mjs';
import {SEARCH_TREE} from './tree.mjs';

const cwd = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../..',
);

/** @param {any} r */
const keyOf = r => `${r.domain}:${r.name}:${r.section ?? ''}`;

describe('doc-topic searcher', () => {
  it('routes a query that names a doc topic to the doc-topic searcher', async () => {
    /** @type {string[]} */
    const steps = [];
    await runTree(
      SEARCH_TREE,
      {query: 'Authoring', options: {cwd}},
      {...(await gatherCandidates({cwd})), data: loadSearchData()},
      {tuning: {onTrace: s => steps.push(s.id)}},
    );
    expect(steps).toEqual(['root', 'doc-topic']);
  }, 60_000);

  it("lists the topic's sections before passing mentions of another kind", async () => {
    const ours = await search('Authoring', {cwd});
    const lexical = await searchCore('Authoring', {cwd, limit: 1000});
    const own = (/** @type {any} */ r) =>
      r.domain === 'doc' && r.name === 'authoring';
    const results = ours.data.results;
    expect(own(results[0])).toBe(true);
    const lastOwn = results.map(own).lastIndexOf(true);
    for (const r of results.slice(0, lastOwn + 1)) {
      if (!own(r)) expect(String(r.reason)).not.toMatch(/mentions/);
    }
    // Same matches, scores, reasons and count as the lexical ranker.
    expect(ours.data.matchCount).toBe(lexical.data.matchCount);
    const byKey = new Map(lexical.data.results.map(r => [keyOf(r), r]));
    for (const r of results) {
      expect(byKey.get(keyOf(r))?.score).toBe(r.score);
      expect(byKey.get(keyOf(r))?.reason).toBe(r.reason);
    }
  }, 60_000);

  it('leaves a query that names no doc topic to the classifier', async () => {
    /** @type {string[]} */
    const steps = [];
    await runTree(
      SEARCH_TREE,
      {query: 'button', options: {cwd}},
      {...(await gatherCandidates({cwd})), data: loadSearchData()},
      {tuning: {onTrace: s => steps.push(s.id)}},
    );
    expect(steps).not.toContain('doc-topic');
  }, 60_000);
});
