// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Unit tests for build's block picker on small hand-written weights: it
 * only re-orders the blocks build names (never another block, never more), a
 * block the request names keeps its slot, as does a block the weights do not
 * know or an integration ships, and ties keep build's order.
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
const signals = (kitBlocks, foreign = []) => ({
  kitBlocks,
  searched: SEARCHED,
  foreign,
});

describe('pickBlocks', () => {
  it('re-orders only the blocks build names, never adding one', () => {
    const own = ['TableBasic', 'ListPlain', 'CardStat'];
    const picks = pickBlocks('sales chart with a row', signals(own), WORDS);
    expect([...picks].sort()).toEqual([...own].sort());
    expect(picks).toEqual(['CardStat', 'TableBasic', 'ListPlain']);
  });

  it('never names a block the words score highly that build did not name', () => {
    const picks = pickBlocks(
      'sales chart chart chart',
      signals(['TableBasic', 'ListPlain']),
      WORDS,
    );
    expect(picks).not.toContain('ChartBar');
    expect(picks).toHaveLength(2);
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
    expect([...picks].sort()).toEqual([...own].sort());
  });

  it('keeps build’s order on ties and when no word is known', () => {
    const own = ['X', 'Y', 'Z'];
    expect(
      pickBlocks('??', {kitBlocks: own, searched: [], foreign: []}, TIES),
    ).toEqual(own);
  });

  it('returns nothing when build names no block, and does not change its input', () => {
    expect(pickBlocks('sales chart', signals([]), WORDS)).toEqual([]);
    const own = ['TableBasic', 'ListPlain'];
    const copy = [...own];
    pickBlocks('sales chart', signals(own), WORDS);
    expect(own).toEqual(copy);
  });
});
