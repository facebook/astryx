// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file reorderModel.test.ts
 * @input reorderModel.ts and the UIKit reorder values (motion/uikit/reorder.ts)
 * @output Unit proofs of the reorder model against the UIKit lab measurements
 *   (iOS 26.2 simulator, a table of 44 pt rows with rows 6 and 9 at 88 pt):
 *   the proposed slots of a measured drag, the movable range, the displaced
 *   rows' offsets, the slot's place, the drop's spring durations, the slides'
 *   shortening while autoscrolling and the autoscroll steps
 * @position Tests for List/reorderModel.ts
 */

import {describe, expect, it} from 'vitest';
import {reorder} from '../../motion/uikit/reorder';
import {
  autoscrollStep,
  clampTop,
  movableRange,
  moveIndex,
  offsetsFor,
  proposedSlot,
  settleSpring,
  slideSpring,
  slotTop,
  type ReorderGeometry,
  type ReorderRow,
} from '../reorderModel';

function table(
  heights: ReadonlyArray<number>,
  {gap = 0, fixed = []}: {gap?: number; fixed?: ReadonlyArray<number>} = {},
): ReorderGeometry {
  let top = 0;
  const rows: ReorderRow[] = heights.map((height, index) => {
    const row = {top, height, isFixed: fixed.includes(index)};
    top += height + gap;
    return row;
  });
  return {rows, gap};
}

/** The measured table: 40 rows of 44 pt, rows 6 and 9 at 88 pt. */
const MEASURED = table(
  Array.from({length: 40}, (_, index) =>
    index === 6 || index === 9 ? 88 : 44,
  ),
);

describe('proposedSlot', () => {
  it('reproduces the measured drag of row 3 down over the 88 pt row and back', () => {
    // Each proposal of the UIKit lab drag (table.proposed), with the dragged
    // row's centre (list coordinates) on the frame before it. Down, the slot
    // moves once the centre is past the boundary; up, once it is back on it.
    const measured: ReadonlyArray<[center: number, slot: number]> = [
      [178, 4],
      [221, 5],
      [309, 6],
      [354, 7],
      [398, 8],
      [396, 7],
      [352, 6],
      [306.8, 5],
    ];
    for (const [center, slot] of measured) {
      expect(proposedSlot(MEASURED, 3, center), `centre ${center}`).toBe(slot);
    }
  });

  it('swaps a 44 pt neighbour after half a row and the 88 pt row after its height', () => {
    // Row 3's centre starts at 3 × 44 + 22 = 154.
    expect(proposedSlot(MEASURED, 3, 154)).toBe(3);
    expect(proposedSlot(MEASURED, 3, 154 + 22)).toBe(3);
    expect(proposedSlot(MEASURED, 3, 154 + 22.5)).toBe(4);
    expect(proposedSlot(MEASURED, 3, 154 - 22)).toBe(2);
    // From slot 5 (centre past 220) to slot 6 takes the 88 pt row's height.
    expect(proposedSlot(MEASURED, 3, 221)).toBe(5);
    expect(proposedSlot(MEASURED, 3, 307)).toBe(5);
    expect(proposedSlot(MEASURED, 3, 309)).toBe(6);
  });

  it('does not move a tall row whose centre starts on a short neighbour boundary', () => {
    const geometry = table([44, 88, 44, 44]);
    // Row 1's centre (44 + 44) is the next row's boundary without it.
    expect(proposedSlot(geometry, 1, 88)).toBe(1);
    expect(proposedSlot(geometry, 1, 89)).toBe(2);
  });

  it('puts the boundary in the middle of the gap between rows', () => {
    const geometry = table([40, 40, 40], {gap: 4});
    // Without row 0, row 1 sits at 0..40; its boundary is at 42.
    expect(proposedSlot(geometry, 0, 42)).toBe(0);
    expect(proposedSlot(geometry, 0, 42.5)).toBe(1);
  });

  it('stops at a fixed row', () => {
    const geometry = table([44, 44, 44, 44, 44], {fixed: [3]});
    expect(proposedSlot(geometry, 0, 1000)).toBe(2);
    expect(proposedSlot(geometry, 4, -1000)).toBe(4);
  });
});

describe('movableRange', () => {
  it('is bounded by the nearest fixed rows', () => {
    const {rows} = table([44, 44, 44, 44, 44, 44], {fixed: [1, 4]});
    expect(movableRange(rows, 2)).toEqual({start: 2, end: 3});
    expect(movableRange(rows, 0)).toEqual({start: 0, end: 0});
    expect(movableRange(rows, 5)).toEqual({start: 5, end: 5});
    expect(movableRange(table([44, 44, 44]).rows, 1)).toEqual({
      start: 0,
      end: 2,
    });
  });
});

describe('offsetsFor and slotTop', () => {
  it('moves the rows between the place and the slot by the dragged row', () => {
    expect(offsetsFor(MEASURED, 3, 5).slice(0, 8)).toEqual([
      0, 0, 0, 0, -44, -44, 0, 0,
    ]);
    expect(offsetsFor(MEASURED, 6, 4).slice(0, 8)).toEqual([
      0, 0, 0, 0, 88, 88, 0, 0,
    ]);
    const gapped = table([40, 40, 40], {gap: 4});
    expect(offsetsFor(gapped, 0, 2)).toEqual([0, -44, -44]);
  });

  it('places the dragged row where the displaced rows leave room', () => {
    // Row 3 to slot 6 (past the 88 pt row): 3 × 44 + 44 + 88 … row 6's
    // bottom (352) minus its own 44.
    expect(slotTop(MEASURED, 3, 6)).toBe(308);
    expect(slotTop(MEASURED, 3, 1)).toBe(44);
    expect(slotTop(MEASURED, 3, 3)).toBe(132);
    const gapped = table([40, 40, 40], {gap: 4});
    expect(slotTop(gapped, 0, 2)).toBe(88);
    expect(slotTop(gapped, 2, 0)).toBe(0);
  });

  it('orders the rows after a move', () => {
    expect(moveIndex(5, 1, 3)).toEqual([0, 2, 3, 1, 4]);
    expect(moveIndex(5, 4, 0)).toEqual([4, 0, 1, 2, 3]);
  });
});

describe('settleSpring', () => {
  it('scales the measured drop durations by the distance up to half the row', () => {
    // 44 pt row released 12 pt from its slot: 0.1636 s.
    expect(settleSpring(12, 44).duration).toBeCloseTo(0.1636, 4);
    // 88 pt row released 12 / 22 / 33 / 43 pt away.
    const measured: ReadonlyArray<[number, number]> = [
      [12, 0.0818],
      [22, 0.15],
      [33, 0.225],
      [43, 0.2932],
    ];
    for (const [distance, duration] of measured) {
      expect(settleSpring(distance, 88).duration).toBeCloseTo(duration, 3);
      expect(settleSpring(-distance, 88).duration).toBeCloseTo(duration, 3);
    }
    expect(settleSpring(200, 44)).toEqual({
      duration: reorder.settle.maxDuration,
      bounce: 0,
    });
  });

  it('never makes a spring shorter than a frame', () => {
    expect(settleSpring(0, 44).duration).toBeCloseTo(1 / 60, 6);
  });
});

describe('slideSpring', () => {
  it('is the table spring at rest and shortens with the autoscroll step', () => {
    expect(slideSpring()).toEqual({duration: 0.3, bounce: 0});
    // Measured: 0.24 / 0.21 / 0.18 / 0.03 s at 2 / 3 / 4 / 9 pt per tick.
    expect(slideSpring(2).duration).toBeCloseTo(0.24, 6);
    expect(slideSpring(3).duration).toBeCloseTo(0.21, 6);
    expect(slideSpring(4).duration).toBeCloseTo(0.18, 6);
    expect(slideSpring(9).duration).toBeCloseTo(0.03, 6);
    expect(slideSpring(10).duration).toBeCloseTo(1 / 60, 6);
  });
});

describe('autoscrollStep', () => {
  it('follows the measured steps by edge depth', () => {
    expect(autoscrollStep(-12)).toBe(0);
    expect(autoscrollStep(-reorder.autoscroll.startInset - 0.5)).toBe(0);
    expect(autoscrollStep(-reorder.autoscroll.startInset)).toBe(2);
    expect(autoscrollStep(-3)).toBe(2);
    expect(autoscrollStep(6)).toBe(2);
    expect(autoscrollStep(8)).toBe(3);
    expect(autoscrollStep(10)).toBe(3);
    expect(autoscrollStep(12)).toBe(4);
    expect(autoscrollStep(16)).toBe(6);
    expect(autoscrollStep(20)).toBe(8);
    expect(autoscrollStep(22)).toBe(10);
    expect(autoscrollStep(40)).toBe(10);
  });

  it('interpolates whole points between samples', () => {
    expect(autoscrollStep(14)).toBe(5);
    expect(autoscrollStep(21)).toBe(9);
    for (let depth = -8; depth <= 30; depth += 0.25) {
      expect(Number.isInteger(autoscrollStep(depth))).toBe(true);
    }
  });
});

describe('clampTop', () => {
  it('keeps the centre between the edges', () => {
    // The measured top clamp: a 44 pt row on a table starting at 62 stops at
    // a top of 40 (its centre on the edge).
    expect(clampTop(0, 44, 62, 800)).toBe(40);
    expect(clampTop(100, 44, 62, 800)).toBe(100);
    expect(clampTop(900, 44, 62, 800)).toBe(778);
  });
});
