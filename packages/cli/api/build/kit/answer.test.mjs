// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {kitAnswer} from './answer.mjs';

/**
 * @param {any[]} blocks
 * @param {any[]} [searched] blocks search returned that build did not name
 */
const signals = (blocks, searched = []) =>
  /** @type {any} */ ({
    query: 'q',
    matchCount: blocks.length,
    directMatch: false,
    start: null,
    pages: [],
    blocks,
    kitBlocks: blocks.map(b => b.name),
    domain: [],
    searchedEntries: new Map(searched.map(b => [b.name, b])),
  });

describe('kitAnswer', () => {
  const a = {name: 'Hero', package: '@a/one', score: 90, reason: 'name'};
  const b = {name: 'Hero', package: '@b/two', score: 80, reason: 'name'};
  const c = {name: 'Footer', package: '@a/one', score: 70, reason: 'keyword'};

  it('keeps blocks of the same name from two packages', () => {
    const kit = kitAnswer(signals([a, b, c]));
    expect(kit.data.blocks).toEqual([a, b, c]);
  });

  it('keeps both when the picker re-orders them', () => {
    const kit = kitAnswer(signals([a, b, c]), ['Footer', 'Hero', 'Hero']);
    expect(kit.data.blocks).toEqual([c, a, b]);
  });

  it('never lists a block neither build nor search gave, or more than build gave', () => {
    const kit = kitAnswer(signals([a, c]), ['Hero', 'Hero', 'Nav', 'Footer']);
    expect(kit.data.blocks).toEqual([a, c]);
  });

  it('lists a block search returned with search’s own entry, within build’s count', () => {
    const nav = {name: 'Nav', package: '@a/one', score: 60, reason: 'keyword'};
    const kit = kitAnswer(signals([a, c], [nav]), [
      'Nav',
      'Nav',
      'Hero',
      'Footer',
    ]);
    expect(kit.data.blocks).toEqual([nav, a]);
  });
});
