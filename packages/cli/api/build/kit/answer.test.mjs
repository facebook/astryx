// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {kitAnswer} from './answer.mjs';

/** @param {any[]} blocks */
const signals = blocks =>
  /** @type {any} */ ({
    query: 'q',
    matchCount: blocks.length,
    directMatch: false,
    start: null,
    pages: [],
    blocks,
    kitBlocks: blocks.map(b => b.name),
    domain: [],
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

  it('never lists a block build did not give, or more than it gave', () => {
    const kit = kitAnswer(signals([a, c]), ['Hero', 'Hero', 'Nav', 'Footer']);
    expect(kit.data.blocks).toEqual([a, c]);
  });
});
