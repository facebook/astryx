// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Unit tests for build's block picker on small hand-written weights: its
 * blocks come from build's own list or search's results (never another,
 * never more), a block search returned joins only if it shares a content word
 * with the request, a block the request names keeps its slot, as does a block
 * the weights do not know or an integration ships, and ties keep the order.
 */

import {describe, expect, it} from 'vitest';
import {pickBlocks} from './blocks.mjs';

/** @type {import('./blocks.mjs').BlockPickerWeights} */
const WORDS = {
  vocab: {chart: 1024, table: 2048, sales: 1536, 'sales chart': 3072, row: 512},
  classes: ['ChartBar', 'TableBasic', 'CardStat', 'ListPlain', 'CalendarBasic'],
  bias: [10, -20, 0, -64, 0],
  words: {
    chart: [0, 90, 2, 30],
    table: [1, 120, 3, -40],
    'sales chart': [0, 60, 2, 50],
    row: [2, 80],
  },
  theta: [0.5, 0.25, 0.5, 0.4, 1.5],
};
/** @type {[string, number, number, number][]} */
const SEARCHED = [
  ['TableBasic', 96, 1, 3],
  ['ListPlain', 64, 1, 3],
  ['ChartBar', 50, 1, 3],
  ['CardStat', 40, 1, 3],
];

/**
 * Two blocks, no words, and a theta that prefers a block build did not name:
 * a block search returned wins the slot whenever the word check lets it in.
 * @type {import('./blocks.mjs').BlockPickerWeights}
 */
const TIES_ALL = {
  vocab: {},
  classes: ['ListPlain', 'CardStat'],
  bias: [0, 0],
  words: {},
  theta: [0, 0, -1, 0, 0],
};

/** @type {import('./blocks.mjs').BlockPickerWeights} */
const TIES = {
  vocab: {alpha: 1024},
  classes: ['X', 'Y', 'Z'],
  bias: [0, 0, 0],
  words: {},
  theta: [0, 0, 0, 0, 1],
};

/**
 * @param {string[]} kitBlocks
 * @param {string[]} [foreign]
 */
const signals = (kitBlocks, foreign = [], searched = SEARCHED) => ({
  kitBlocks,
  searched,
  foreign,
  blockText: new Map([
    ['ChartBar', 'Bar chart A bar chart of sales by month.'],
    ['CardStat', 'Stat card A card with one number.'],
    ['ListPlain', 'Plain list A list of rows.'],
    ['TableBasic', 'Basic table A table of rows.'],
  ]),
});

describe('pickBlocks', () => {
  it('names only blocks from build’s list or search’s, as many as build’s', () => {
    const own = ['TableBasic', 'ListPlain', 'CardStat'];
    const picks = pickBlocks('sales chart with a row', signals(own), WORDS);
    const allowed = new Set([...own, ...SEARCHED.map(s => s[0])]);
    expect(picks).toHaveLength(own.length);
    for (const b of picks) expect(allowed.has(b)).toBe(true);
    expect(new Set(picks).size).toBe(picks.length);
  });

  it('adds a block search returned that shares a word with the request', () => {
    const picks = pickBlocks(
      'sales chart chart chart',
      signals(['TableBasic', 'ListPlain']),
      WORDS,
    );
    expect(picks).toContain('ChartBar');
    expect(picks).toHaveLength(2);
  });

  it('never adds a block search did not return, or one sharing no word', () => {
    const searched = /** @type {[string, number, number, number][]} */ ([
      ['TableBasic', 96, 1, 3],
      ['CardStat', 90, 1, 3],
    ]);
    const picks = pickBlocks(
      'sales chart chart chart',
      signals(['TableBasic', 'ListPlain'], [], searched),
      WORDS,
    );
    expect(picks).not.toContain('ChartBar');
    expect(picks).not.toContain('CardStat');
    expect([...picks].sort()).toEqual(['ListPlain', 'TableBasic']);
  });

  it('keeps a block the request names in its slot', () => {
    const own = ['TableBasic', 'CalendarBasic', 'CardStat'];
    for (const request of [
      'sales chart with a calendar',
      'sales chart with two calendars',
      'sales chart, calendar basic',
    ]) {
      expect(pickBlocks(request, signals(own), WORDS)[1]).toBe('CalendarBasic');
    }
  });

  it('keeps a block the weights do not know or an integration ships in its slot', () => {
    const own = ['TableBasic', 'AcmeCallout', 'CardStat', 'ListPlain'];
    const picks = pickBlocks(
      'sales chart with a row',
      signals(own, ['ListPlain']),
      WORDS,
    );
    expect(picks[1]).toBe('AcmeCallout');
    expect(picks[3]).toBe('ListPlain');
    expect(picks).toHaveLength(own.length);
  });

  it('keeps build’s order on ties and when no word is known', () => {
    const own = ['X', 'Y', 'Z'];
    expect(
      pickBlocks(
        '??',
        {kitBlocks: own, searched: [], foreign: [], blockText: new Map()},
        TIES,
      ),
    ).toEqual(own);
  });

  it('returns nothing when build names no block, and does not change its input', () => {
    expect(pickBlocks('sales chart', signals([]), WORDS)).toEqual([]);
    const own = ['TableBasic', 'ListPlain'];
    const copy = [...own];
    pickBlocks('sales chart', signals(own), WORDS);
    expect(own).toEqual(copy);
  });

  it('reads a request word and a block word as the same up to plural and stem', () => {
    for (const [word, blockWord] of [
      ['settings', 'setting'],
      ['statuses', 'status'],
      ['tables', 'table'],
      ['classes', 'class'],
      ['files', 'file'],
      ['categories', 'category'],
    ]) {
      const sig = {
        kitBlocks: ['ListPlain'],
        searched: /** @type {[string, number, number, number][]} */ ([
          ['ListPlain', 96, 1, 3],
          ['CardStat', 90, 1, 3],
        ]),
        foreign: [],
        blockText: new Map([['CardStat', `Stat card. A ${blockWord} panel.`]]),
      };
      expect(pickBlocks(`one ${word} view`, sig, TIES_ALL)).toEqual([
        'CardStat',
      ]);
    }
    const none = {
      kitBlocks: ['ListPlain'],
      searched: /** @type {[string, number, number, number][]} */ ([
        ['ListPlain', 96, 1, 3],
        ['CardStat', 90, 1, 3],
      ]),
      foreign: [],
      blockText: new Map([['CardStat', 'Stat card. A setting panel.']]),
    };
    expect(pickBlocks('one widget view', none, TIES_ALL)).toEqual([
      'ListPlain',
    ]);
  });

  it('never adds a block that shares only a function word with the request', () => {
    const searched = /** @type {[string, number, number, number][]} */ ([
      ['TableBasic', 96, 1, 3],
      ['CardStat', 90, 1, 3],
    ]);
    const sig = {
      kitBlocks: ['TableBasic', 'ListPlain'],
      searched,
      foreign: [],
      blockText: new Map([['CardStat', 'Stat card Each card under a header.']]),
    };
    const picks = pickBlocks('each row under which', sig, WORDS);
    expect(picks).not.toContain('CardStat');
  });
  it('never adds a block for a function word alone', () => {
    const sig = {
      kitBlocks: ['ListPlain'],
      searched: /** @type {[string, number, number, number][]} */ ([
        ['ListPlain', 96, 1, 3],
        ['CardStat', 90, 1, 3],
      ]),
      foreign: [],
      blockText: new Map([
        [
          'CardStat',
          'Shows which one is done. Each, every, any, some, all, both, either, neither, few, many, much, several, such, that, who, whom, whose.',
        ],
      ]),
    };
    for (const w of 'which that who whom whose each every any some all both either neither few many much several such'.split(
      ' ',
    ))
      expect(pickBlocks(`a ${w} b`, sig, TIES_ALL)).toEqual(['ListPlain']);
    expect(pickBlocks('each, which', sig, TIES_ALL)).toEqual(['ListPlain']);
  });
});
