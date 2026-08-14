// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file snapOffsets.test.ts
 * @input Uses vitest, snapOffsets pure helpers
 * @output Unit tests for the snap-point -> translateY offset geometry
 * @position Testing; validates snapOffsets.ts (no DOM needed)
 *
 * SYNC: When snapOffsets.ts changes, update these tests to match.
 */

import {describe, it, expect} from 'vitest';
import {
  snapFractionsToHeights,
  computeDetentOffsets,
  nearestOffset,
  resolveSettleOffset,
  scrimOpacityForOffset,
  DETENT_DEDUP_PX,
} from './snapOffsets';

describe('snapFractionsToHeights', () => {
  it('scales in-range fractions to px', () => {
    expect(snapFractionsToHeights([0.5, 0.92], 800)).toEqual([400, 736]);
  });
  it('drops out-of-range fractions', () => {
    expect(snapFractionsToHeights([0, 0.5, 1, 1.2, -0.3], 1000)).toEqual([
      500, 1000,
    ]);
  });
});

describe('computeDetentOffsets', () => {
  it('always includes fully-open (0) first, ascending', () => {
    // sheet 800; detent visible heights 400, 640 -> offsets 400, 160 -> sorted
    expect(computeDetentOffsets(800, [400, 640])).toEqual([0, 160, 400]);
  });

  it('drops detents at or taller than the sheet (cannot translate up)', () => {
    // 800 and 900 are >= sheet 800 -> dropped; only 500 (offset 300) remains
    expect(computeDetentOffsets(800, [500, 800, 900])).toEqual([0, 300]);
  });

  it('de-dupes near-equal detents, keeping the taller (smaller offset)', () => {
    // sheet 800; heights 760 (offset 40) and 400 (offset 400). 40 is within
    // DETENT_DEDUP_PX of the fully-open 0 -> collapses to just [0, 400].
    expect(computeDetentOffsets(800, [760, 400])).toEqual([0, 400]);
  });

  it('keeps detents that are farther apart than the dedup threshold', () => {
    // offsets 0, 100, 400 with default 48px dedup -> all kept
    expect(computeDetentOffsets(800, [700, 400])).toEqual([0, 100, 400]);
  });

  it('respects a custom dedup threshold', () => {
    // offsets 0, 100, 400; dedup 150 -> 100 collapses into 0
    expect(computeDetentOffsets(800, [700, 400], 150)).toEqual([0, 400]);
  });

  it('a single-height sheet has just the fully-open detent', () => {
    expect(computeDetentOffsets(600, [])).toEqual([0]);
  });
});

describe('nearestOffset', () => {
  it('picks the closest offset', () => {
    expect(nearestOffset(180, [0, 200, 400])).toBe(200);
    expect(nearestOffset(90, [0, 200, 400])).toBe(0);
  });
});

describe('resolveSettleOffset', () => {
  const offsets = [0, 200, 400]; // full, mid, short

  it('a down-drag never settles above the starting detent', () => {
    // start at mid (200), drag down to ~240 -> nearest at/below is 200 (mid),
    // never back up to 0.
    expect(resolveSettleOffset(240, offsets, 1, 200)).toBe(200);
  });

  it('a down-drag past the midpoint moves to the next lower detent', () => {
    // start mid (200), drag to 320 -> nearest at/below is 400 (short)
    expect(resolveSettleOffset(320, offsets, 1, 200)).toBe(400);
  });

  it('an up-drag never settles below the starting detent', () => {
    // start mid (200), drag up to ~160 -> nearest at/above is 0 or 200; 160 is
    // closer to 200, so it holds mid rather than dropping to short.
    expect(resolveSettleOffset(160, offsets, -1, 200)).toBe(200);
  });

  it('an up-drag past the midpoint expands to the next higher detent', () => {
    // start mid (200), drag up to 80 -> nearest at/above is 0 (full)
    expect(resolveSettleOffset(80, offsets, -1, 200)).toBe(0);
  });

  it('with no direction, picks the plain nearest', () => {
    expect(resolveSettleOffset(180, offsets, 0, 200)).toBe(200);
  });
});

describe('scrimOpacityForOffset', () => {
  describe('with a peek detent (>= 2 detents)', () => {
    const offsets = [0, 100, 200]; // full, mid, peek
    const dismissOffset = 280;

    it('is full at or above the mid detent', () => {
      expect(scrimOpacityForOffset(0, offsets, dismissOffset)).toBe(1);
      expect(scrimOpacityForOffset(100, offsets, dismissOffset)).toBe(1);
      expect(scrimOpacityForOffset(60, offsets, dismissOffset)).toBe(1);
    });

    it('fades linearly from the mid detent toward the peek floor', () => {
      // Halfway from mid (100) to peek (200), opacity is halfway from 1 to the
      // 0.3 floor => 0.65.
      expect(scrimOpacityForOffset(150, offsets, dismissOffset)).toBeCloseTo(
        0.65,
      );
    });

    it('thins to the peek floor at or below the peek detent (still modal)', () => {
      expect(scrimOpacityForOffset(200, offsets, dismissOffset)).toBeCloseTo(
        0.3,
      );
      expect(scrimOpacityForOffset(240, offsets, dismissOffset)).toBeCloseTo(
        0.3,
      );
    });
  });

  describe('with a single detent (no peek)', () => {
    const offsets = [0];
    const dismissOffset = 160;

    it('stays full until the drag begins collapsing', () => {
      expect(scrimOpacityForOffset(0, offsets, dismissOffset)).toBe(1);
    });

    it('fades across the dismiss overshoot toward the threshold', () => {
      expect(scrimOpacityForOffset(80, offsets, dismissOffset)).toBeCloseTo(
        0.5,
      );
      expect(scrimOpacityForOffset(160, offsets, dismissOffset)).toBe(0);
    });
  });
});

describe('DETENT_DEDUP_PX', () => {
  it('is a sane positive threshold', () => {
    expect(DETENT_DEDUP_PX).toBeGreaterThan(0);
  });
});
