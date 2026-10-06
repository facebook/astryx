// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';

import {SHELL, stem, weighStart, weightWords} from './weights.mjs';

// A made-up table for tests only: three page templates and the app shell.
const CANDIDATES = [SHELL, 'board', 'charts', 'grid'];

/**
 * @param {Record<string, number[]>} weights per word, one value per candidate
 * @param {number[]} [bias]
 * @param {number} [step]
 * @param {number} [clip]
 */
function table(weights, bias = [0, 0, 0, 0], step = 0.5, clip = 4) {
  return {
    words: Object.keys(weights),
    bias,
    clip,
    step,
    rows: Object.values(weights).map(ws =>
      ws
        .map(w => String.fromCharCode(97 + Math.round((w + clip) / step)))
        .join(''),
    ),
  };
}

const WEIGHTS = {
  version: 1,
  candidates: CANDIDATES,
  tables: [
    table({
      [stem('kanban')]: [0, 3, 0, 0],
      [stem('existing')]: [3, 0, 0, 0],
      [stem('charts')]: [0, 0, 2, 0],
    }),
    table({[stem('cards')]: [0, 0, 0, 1]}, [0, 0, 0, 0], 1, 4),
  ],
  // three numbers per member (table 1, the ranker, table 2), then one for SHELL
  blend: [1, 0, 0, 0.5, 0, 0, 0.2, 0, 0, 0],
};
const CATALOG = [
  {name: 'board'},
  {name: 'charts'},
  {name: 'grid'},
  {name: 'top-nav'},
];

/**
 * @param {string} name
 * @param {number} score
 * @param {string} family
 */
const page = (name, score, family) => ({
  name,
  score,
  hits: 1,
  family,
  base: true,
  familyNamed: false,
  containerMatched: false,
  matched: new Set(),
});
/** A ranker output that prefers `charts`. */
const RANKED = [
  page('charts', 3, 'Charts'),
  page('grid', 1, 'Grid'),
  page('board', 0.5, 'Board'),
  page('top-nav', 0, 'Shell'),
];

describe('weighStart', () => {
  it('lets the word weights outvote the ranker', () => {
    const start = weighStart(
      'a kanban for launches',
      RANKED,
      RANKED[0],
      CATALOG,
      {
        weights: WEIGHTS,
      },
    );
    expect(start).toBe('board');
  });

  it('keeps the ranker when the words carry no weight', () => {
    const start = weighStart('something else', RANKED, RANKED[0], CATALOG, {
      weights: WEIGHTS,
    });
    expect(start).toBe('charts');
  });

  it('returns null for the app shell', () => {
    const start = weighStart('tweak the existing page', RANKED, null, CATALOG, {
      weights: WEIGHTS,
    });
    expect(start).toBeNull();
  });

  it('returns undefined without weights, so the ranker decides', () => {
    const start = weighStart('a kanban', RANKED, RANKED[0], CATALOG, {
      weights: null,
    });
    expect(start).toBeUndefined();
  });

  it('never starts from a template the project does not have', () => {
    const catalog = CATALOG.filter(t => t.name !== 'board');
    const ranked = RANKED.filter(r => r.name !== 'board');
    const start = weighStart('a kanban', ranked, ranked[0], catalog, {
      weights: WEIGHTS,
    });
    expect(start).not.toBe('board');
  });

  it('scores a template the table does not list through the ranker', () => {
    const rankerLed = {...WEIGHTS, blend: [0.1, 0, 0, 2, 0, 1, 0.1, 0, 0, 0]};
    const catalog = [...CATALOG, {name: 'fresh'}];
    const ranked = [page('fresh', 9, 'Fresh'), ...RANKED];
    const start = weighStart('a page', ranked, ranked[0], catalog, {
      weights: rankerLed,
    });
    expect(start).toBe('fresh');
  });

  it('never starts an idea that asks for a new page from the shell', () => {
    const start = weighStart('the existing page', RANKED, RANKED[0], CATALOG, {
      weights: WEIGHTS,
      newPage: true,
    });
    expect(start).toBe('charts');
  });

  it('keeps a template the ranker placed by its frame', () => {
    const framed = {...RANKED[1], containerMatched: true};
    const start = weighStart('the existing page', RANKED, framed, CATALOG, {
      weights: WEIGHTS,
    });
    expect(start).toBe('grid');
  });

  it('is deterministic', () => {
    const run = () =>
      weighStart('kanban charts cards', RANKED, RANKED[0], CATALOG, {
        weights: WEIGHTS,
      });
    expect(run()).toBe(run());
  });
});

describe('weightWords', () => {
  it('keeps letter words of two or more characters', () => {
    expect(weightWords('A 3-col Dashboard, v2 KPIs!')).toEqual([
      'col',
      'dashboard',
      'kpis',
    ]);
  });
});
