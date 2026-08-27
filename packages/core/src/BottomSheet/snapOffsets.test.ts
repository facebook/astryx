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
  computeDetentOffsets,
  isValidSnapPoint,
  nearestOffset,
  peekOffsetFor,
  resolveSettleOffset,
  resolveSnapPoints,
  scrimOpacityForOffset,
  DETENT_DEDUP_PX,
} from './snapOffsets';

describe('resolveSnapPoints', () => {
  it('reads a bare number as a fraction of the viewport', () => {
    expect(resolveSnapPoints([0.5, 0.92], 800)).toEqual([400, 736]);
  });

  it('reads a percentage as the same fraction', () => {
    expect(resolveSnapPoints(['50%', '92%'], 800)).toEqual([400, 736]);
  });

  it('reads a px length as an absolute height', () => {
    expect(resolveSnapPoints(['320px'], 800)).toEqual([320]);
  });

  it('keeps the caller order, mixing forms', () => {
    expect(resolveSnapPoints(['120px', 0.5, '90%'], 800)).toEqual([
      120, 400, 720,
    ]);
  });

  it('accepts fractional and unit-cased lengths, and surrounding space', () => {
    expect(resolveSnapPoints(['12.5%', '0.5PX', ' 80px '], 800)).toEqual([
      100, 0.5, 80,
    ]);
  });

  it('drops numbers outside the (0, 1] fraction range', () => {
    // 200 is the px mistake — a bare number is never a length.
    expect(resolveSnapPoints([0, 0.5, 1, 1.2, -0.3, 200], 1000)).toEqual([
      500, 1000,
    ]);
  });

  it('drops lengths it cannot resolve by arithmetic on the viewport', () => {
    expect(
      resolveSnapPoints(
        ['50', '30rem', '50vh', 'calc(50% - 20px)', '-10px', '', '0px'],
        800,
      ),
    ).toEqual([]);
  });
});

describe('isValidSnapPoint', () => {
  it('accepts the three supported forms', () => {
    expect(isValidSnapPoint(0.5)).toBe(true);
    expect(isValidSnapPoint(1)).toBe(true);
    expect(isValidSnapPoint('50%')).toBe(true);
    expect(isValidSnapPoint('320px')).toBe(true);
  });

  it('rejects what resolveSnapPoints would silently drop', () => {
    expect(isValidSnapPoint(200)).toBe(false);
    expect(isValidSnapPoint(0)).toBe(false);
    expect(isValidSnapPoint('50')).toBe(false);
    expect(isValidSnapPoint('50vh')).toBe(false);
    expect(isValidSnapPoint('calc(50% - 20px)')).toBe(false);
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

describe('peekOffsetFor', () => {
  it('is the shortest stop when that stop is a sliver', () => {
    // sheet 800; stops at 800, 400 and 100 visible px. The 100px stop is an
    // eighth of the sheet, well inside the quarter that makes a peek.
    expect(peekOffsetFor([0, 400, 700], 800)).toBe(700);
  });

  it('has no peek when the shortest stop is a working height', () => {
    // A half-height stop lays its content out and keeps a full scrim; it is
    // the sheet the caller asked for, not a glance at one.
    expect(peekOffsetFor([0, 400], 800)).toBeNull();
  });

  it('has no peek when the sheet has no collapsed stop', () => {
    expect(peekOffsetFor([0], 800)).toBeNull();
  });

  it('takes the quarter mark itself as a peek', () => {
    expect(peekOffsetFor([0, 600], 800)).toBe(600);
  });

  it('has no peek without a measured sheet', () => {
    expect(peekOffsetFor([0, 600], 0)).toBeNull();
  });
});

describe('scrimOpacityForOffset', () => {
  describe('with a peek detent', () => {
    const offsets = [0, 100, 200]; // full, mid, peek
    const peekOffset = 200;
    const dismissOffset = 280;

    it('is full at or above the mid detent', () => {
      expect(scrimOpacityForOffset(0, offsets, dismissOffset, peekOffset)).toBe(
        1,
      );
      expect(
        scrimOpacityForOffset(100, offsets, dismissOffset, peekOffset),
      ).toBe(1);
      expect(
        scrimOpacityForOffset(60, offsets, dismissOffset, peekOffset),
      ).toBe(1);
    });

    it('fades linearly from the mid detent toward the peek floor', () => {
      // Halfway from mid (100) to peek (200), opacity is halfway from 1 to the
      // 0.3 floor => 0.65.
      expect(
        scrimOpacityForOffset(150, offsets, dismissOffset, peekOffset),
      ).toBeCloseTo(0.65);
    });

    it('thins to the peek floor at or below the peek detent (still modal)', () => {
      expect(
        scrimOpacityForOffset(200, offsets, dismissOffset, peekOffset),
      ).toBeCloseTo(0.3);
      expect(
        scrimOpacityForOffset(240, offsets, dismissOffset, peekOffset),
      ).toBeCloseTo(0.3);
    });
  });

  describe('with collapsed stops but no peek among them', () => {
    // The shortest stop is a working height, so the scrim is full there and
    // only fades once the sheet is being dragged out below it.
    const offsets = [0, 100];
    const dismissOffset = 160;

    it('stays full at every stop, including the shortest', () => {
      expect(scrimOpacityForOffset(0, offsets, dismissOffset, null)).toBe(1);
      expect(scrimOpacityForOffset(100, offsets, dismissOffset, null)).toBe(1);
    });

    it('fades only across the dismiss overshoot below the shortest stop', () => {
      expect(
        scrimOpacityForOffset(130, offsets, dismissOffset, null),
      ).toBeCloseTo(0.5);
      expect(scrimOpacityForOffset(160, offsets, dismissOffset, null)).toBe(0);
    });
  });

  describe('with a single detent (no peek)', () => {
    const offsets = [0];
    const dismissOffset = 160;

    it('stays full until the drag begins collapsing', () => {
      expect(scrimOpacityForOffset(0, offsets, dismissOffset, null)).toBe(1);
    });

    it('fades across the dismiss overshoot toward the threshold', () => {
      expect(
        scrimOpacityForOffset(80, offsets, dismissOffset, null),
      ).toBeCloseTo(0.5);
      expect(scrimOpacityForOffset(160, offsets, dismissOffset, null)).toBe(0);
    });
  });
});

describe('DETENT_DEDUP_PX', () => {
  it('is a sane positive threshold', () => {
    expect(DETENT_DEDUP_PX).toBeGreaterThan(0);
  });
});
