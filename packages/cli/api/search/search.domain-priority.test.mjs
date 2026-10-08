// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Domain priority in `search` ranking (api/search/search.mjs), run
 * against the real docs tree and @astryxdesign/core registry.
 *
 * Splitting a large doc into smaller topics gives each topic its own keywords
 * and headings, and a doc keyword or heading that holds the whole query scores
 * 170-190, above a component that matches one word by keyword (98). Every
 * split then puts another doc above the component a reader asked for. Domain
 * priority ranks a component, hook, template, or theme that a query word hits
 * by name or keyword ahead of docs matched only by keyword, title, or prose,
 * and leaves a doc the query names where it was.
 *
 * Both directions are asserted together, so neither can be traded for the
 * other: component queries find the component first, and the obvious question
 * for each guide still finds that guide first.
 */

import {describe, it, expect} from 'vitest';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {docs} from '../docs/docs.mjs';
import {domainPriority, search, scoreQuery, tokenizeQuery} from './search.mjs';

const REPO = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../..',
);
const cwd = REPO;
const SLOW = 30_000;

/**
 * @param {string} q
 * @param {object} candidate
 * @returns {0 | 1 | 2}
 */
const priority = (q, candidate) => {
  const tokens = tokenizeQuery(q);
  const score = scoreQuery(q, tokens, candidate)?.score ?? 0;
  return domainPriority(q, tokens, /** @type {any} */ (candidate), score);
};

/**
 * Every placed guide under a namespace, walked through `docs`.
 * @param {string} route
 * @param {Set<string>} [seen]
 * @returns {Promise<string[]>}
 */
async function placedGuides(route, seen = new Set()) {
  /** @type {any} */
  let node;
  try {
    node = (await docs(route)).data;
  } catch {
    return [];
  }
  /** @type {string[]} */
  const out = [];
  for (const child of (node.slots ?? []).flatMap(
    (/** @type {any} */ slot) => slot.children,
  )) {
    if (!child.route || seen.has(child.route)) continue;
    seen.add(child.route);
    if (child.kind === 'generic' && child.route.includes('/')) {
      out.push(child.route);
    }
    out.push(...(await placedGuides(child.route, seen)));
  }
  return out;
}

describe('search domain priority — the rule', () => {
  it('gives a doc no priority for a keyword or heading match', () => {
    const topic = {
      domain: 'doc',
      name: 'typography/font-setup',
      keywords: ['font size'],
      titles: ['Font Setup', 'Font Sizes'],
    };
    expect(priority('font size', topic)).toBe(0);
  });

  it('gives a doc priority when the query names it', () => {
    const topic = {domain: 'doc', name: 'typography/font-setup'};
    // The whole query spells its last route segment.
    expect(priority('font setup', topic)).toBe(2);
    expect(priority('typography/font-setup', topic)).toBe(2);
    // A word of a longer query is a flat topic's name, or its plural.
    expect(
      priority('product illustration', {domain: 'doc', name: 'illustrations'}),
    ).toBe(1);
  });

  it('gives a component priority for a name or keyword hit, not for prose', () => {
    expect(
      priority('font size', {
        domain: 'component',
        name: 'Text',
        keywords: ['font'],
      }),
    ).toBe(1);
    expect(
      priority('date picker', {domain: 'component', name: 'DatePicker'}),
    ).toBe(1);
    expect(
      priority('font size', {
        domain: 'component',
        name: 'Card',
        description: 'A surface whose font size follows its parent.',
      }),
    ).toBe(0);
  });
});

describe('search domain priority — real docs and components', () => {
  it(
    'finds the Text component before the typography guides for `font size`',
    async () => {
      for (const q of ['font size', 'font weight']) {
        const results = (await search(q, {cwd})).data.results;
        expect(results[0], q).toMatchObject({
          domain: 'component',
          name: 'Text',
        });
        const guide = results.findIndex(
          r => r.domain === 'doc' && /^typography(?:\/|$)/.test(r.name),
        );
        // The guide still matches, below the component.
        expect(guide, q).toBeGreaterThan(0);
      }
    },
    SLOW,
  );

  it(
    'reports the text-match score unchanged',
    async () => {
      const results = (await search('font size', {cwd})).data.results;
      const guide = results.find(
        r => r.domain === 'doc' && /^typography(?:\/|$)/.test(r.name),
      );
      expect(guide?.score).toBeGreaterThan(results[0].score);
    },
    SLOW,
  );

  it(
    'still finds a flat guide first by its name',
    async () => {
      for (const [q, name] of [
        ['motion', 'motion'],
        ['icons', 'icons'],
        ['tokens', 'tokens'],
        ['illustration', 'illustrations'],
        ['use a theme', 'use-a-theme'],
        ['author a theme', 'author-a-theme'],
      ]) {
        const results = (await search(q, {cwd})).data.results;
        expect(results[0], q).toMatchObject({domain: 'doc', name});
      }
    },
    SLOW,
  );

  it(
    'still finds every split topic first by its own name',
    async () => {
      const guides = [];
      for (const ns of ['layout', 'typography', 'tokens', 'styling', 'cli']) {
        guides.push(...(await placedGuides(ns)));
      }
      // The layout split is in the tree; the walk covers whatever else is.
      expect(guides).toContain('layout/layout-spacing');
      /** @type {string[]} */
      const misses = [];
      for (const route of new Set(guides)) {
        const q = route.slice(route.lastIndexOf('/') + 1).replace(/-/g, ' ');
        const top = (await search(q, {cwd})).data.results[0];
        if (top?.domain !== 'doc' || top.name !== route) {
          misses.push(`${q} -> ${top?.domain}:${top?.name}`);
        }
      }
      expect(misses).toEqual([]);
    },
    SLOW * 4,
  );
});
