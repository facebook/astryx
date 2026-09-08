// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {createValueLookup} from './CommandPalette';

/**
 * Operation-count perf test for the delegated hover-highlight lookup.
 *
 * The counted operation is one `item.value` read — one comparison in the
 * previous linear `findIndex` scan, which ran on every bubbled mouseover.
 * Crossing 50 items cost 1,275 comparisons (sum of scan lengths) versus a
 * single Map probe per hover now. Counting is exact (getter-based), like
 * parser.perf.test.ts, so the numbers hold on loaded CI machines.
 */

function makeItems(count: number): {value: string}[] {
  // Plain objects with a counting getter on `value`.
  return Array.from({length: count}, (_, i) => ({
    get value() {
      totalReads++;
      return `item-${i}`;
    },
  }));
}

let totalReads = 0;

/** Simulate the pointer crossing every item once, then ten moves within the last item. */
function simulatedHoverWork(count: number) {
  totalReads = 0;
  const items = makeItems(count);
  const lookup = createValueLookup(items);
  const buildReads = totalReads;
  for (let i = 0; i < count; i++) {
    if (lookup(`item-${i}`) === undefined) {
      throw new Error('missing index');
    }
  }
  for (let i = 0; i < 10; i++) {
    lookup(`item-${count - 1}`);
  }
  return {buildReads, lookupReads: totalReads - buildReads};
}

describe('createValueLookup operation counts', () => {
  it('bounds hover lookups to one Map probe at two list sizes', () => {
    // Ten times the list size does not change the lookup cost: zero
    // `value` reads after the one-time build. A regression to a linear
    // per-event scan would read values on every hover and fail here.
    const small = simulatedHoverWork(50);
    const large = simulatedHoverWork(500);
    expect(small.lookupReads).toBe(0);
    expect(large.lookupReads).toBe(small.lookupReads);
  });

  it('pays exactly one pass over the items when the index is built', () => {
    // The build itself is linear by design (one read per item), charged
    // once per results change — not per mouseover.
    const {buildReads} = simulatedHoverWork(500);
    expect(buildReads).toBe(500);
  });

  it('matches findIndex semantics: first occurrence wins, misses are undefined', () => {
    const items = [{value: 'a'}, {value: 'b'}, {value: 'a'}];
    const lookup = createValueLookup(items);
    expect(lookup('a')).toBe(0);
    expect(lookup('b')).toBe(1);
    expect(lookup('missing')).toBeUndefined();
  });
});
