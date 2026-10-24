// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file reorderModel.ts
 * @input A list's row geometry (layout tops and heights inside the list) and
 *   the reorder values of the UIKit constants table (motion/uikit/reorder.ts)
 * @output Pure functions of a UIKit table's edit-mode reorder: the slot a
 *   dragged row proposes, the offsets of the rows that make room, the dragged
 *   row's place in its slot, the movable range between fixed rows, the drop's
 *   and the slides' springs, the autoscroll step and the tracking clamp
 * @position List internals; useListReorder.ts drives a drag with them. No
 *   DOM, no React: unit tested against the UIKit lab measurements
 *
 * UIKit's rules (iOS 26.2, measured): the proposed slot changes when the
 * dragged row's centre crosses a row boundary of the layout WITHOUT the
 * dragged row, with no hysteresis; the rows between the dragged row's place
 * and its slot each move by the dragged row's height; the drop goes to the
 * current slot, from rest, on a spring whose duration scales with the
 * remaining distance; autoscroll moves a whole number of points per tick,
 * more the deeper the dragged row's edge is past the scroll view's edge.
 */

import type {DurationBounce} from '../motion/spring';
import {reorder} from '../motion/uikit/reorder';

/** One row: its layout top inside the list, its height, and whether it stays put. */
export interface ReorderRow {
  readonly top: number;
  readonly height: number;
  /** A row that cannot move and that other rows cannot cross. */
  readonly isFixed: boolean;
}

export interface ReorderGeometry {
  readonly rows: ReadonlyArray<ReorderRow>;
  /** The space between two consecutive rows. */
  readonly gap: number;
}

/**
 * A spring a numerically tiny duration would make near infinitely stiff: one
 * 60 Hz frame is the shortest a motion lasts. A numerical guard, not a UIKit
 * value (UIKit's shortest measured drop was 0.08 s).
 */
const MIN_SPRING_SECONDS = 1 / 60;

/** How far a row that `dragged` displaces moves: its height plus the gap. */
export function displacement(
  geometry: ReorderGeometry,
  dragged: number,
): number {
  return geometry.rows[dragged].height + geometry.gap;
}

/**
 * The slots `dragged` can take: the rows between the nearest fixed rows above
 * and below it (a fixed row is a barrier, as UIKit's retargeting delegate
 * makes one).
 */
export function movableRange(
  rows: ReadonlyArray<ReorderRow>,
  dragged: number,
): {start: number; end: number} {
  let start = 0;
  let end = rows.length - 1;
  for (let index = dragged - 1; index >= 0; index -= 1) {
    if (rows[index].isFixed) {
      start = index + 1;
      break;
    }
  }
  for (let index = dragged + 1; index < rows.length; index += 1) {
    if (rows[index].isFixed) {
      end = index - 1;
      break;
    }
  }
  return {start, end};
}

/**
 * The slot (0 to n − 1) the dragged row proposes with its centre at `center`
 * (list coordinates): the number of other rows whose boundary, in the layout
 * without the dragged row, lies above the centre. A boundary sits in the
 * middle of the gap after a row. Clamped to the movable range. (A row taller
 * than its neighbour starts with its centre on that neighbour's boundary; it
 * stays in place until the centre passes it.)
 */
export function proposedSlot(
  geometry: ReorderGeometry,
  dragged: number,
  center: number,
): number {
  const {rows, gap} = geometry;
  const shift = displacement(geometry, dragged);
  let slot = 0;
  for (let index = 0; index < rows.length; index += 1) {
    if (index === dragged) {
      continue;
    }
    const top = index < dragged ? rows[index].top : rows[index].top - shift;
    const boundary = top + rows[index].height + gap / 2;
    if (boundary < center) {
      slot += 1;
    }
  }
  const {start, end} = movableRange(rows, dragged);
  return Math.min(end, Math.max(start, slot));
}

/**
 * The offset of every row while `dragged` sits at `slot`: the rows between
 * its place and the slot move by its height plus the gap, toward its place;
 * every other row stays. The dragged row's own entry is 0 (it follows the
 * finger).
 */
export function offsetsFor(
  geometry: ReorderGeometry,
  dragged: number,
  slot: number,
): number[] {
  const shift = displacement(geometry, dragged);
  return geometry.rows.map((_, index) => {
    if (index === dragged) {
      return 0;
    }
    if (slot > dragged && index > dragged && index <= slot) {
      return -shift;
    }
    if (slot < dragged && index < dragged && index >= slot) {
      return shift;
    }
    return 0;
  });
}

/** The dragged row's layout top once it sits at `slot`. */
export function slotTop(
  geometry: ReorderGeometry,
  dragged: number,
  slot: number,
): number {
  const {rows} = geometry;
  if (slot <= dragged) {
    return rows[slot].top;
  }
  // Below its place: the rows up to the slot moved up by its extent, and it
  // sits right after the last of them.
  const last = rows[slot];
  return last.top + last.height - rows[dragged].height;
}

/** Where `from` lands at `to`: the order of the rows' indices after the move. */
export function moveIndex(count: number, from: number, to: number): number[] {
  const order = Array.from({length: count}, (_, index) => index);
  const [moved] = order.splice(from, 1);
  order.splice(to, 0, moved);
  return order;
}

/**
 * The drop's spring: `springDuration` scaled by the remaining distance up to
 * half the dragged row's height, bounce 0 (UIKit starts it from rest).
 */
export function settleSpring(
  distance: number,
  rowHeight: number,
): DurationBounce {
  const full = rowHeight * reorder.settle.fullDistanceRowFraction;
  const fraction = full <= 0 ? 1 : Math.min(1, Math.abs(distance) / full);
  return {
    duration: Math.max(
      MIN_SPRING_SECONDS,
      reorder.settle.maxDuration * fraction,
    ),
    bounce: 0,
  };
}

/**
 * The slide of a row that makes room, shorter while the list autoscrolls by
 * `step` points per tick.
 */
export function slideSpring(step = 0): DurationBounce {
  const {spring, autoscrollShorteningPerStep} = reorder.slide;
  return {
    duration: Math.max(
      MIN_SPRING_SECONDS,
      spring.duration - autoscrollShorteningPerStep * step,
    ),
    bounce: spring.bounce,
  };
}

/**
 * Points per autoscroll tick with the dragged row's edge `depth` points past
 * the scroll edge (negative inside): none further inside than the start
 * inset, then UIKit's measured steps, interpolated and rounded.
 */
export function autoscrollStep(depth: number): number {
  const {depths, stepsPt, startInset} = reorder.autoscroll;
  if (depth < -startInset) {
    return 0;
  }
  if (depth <= depths[0]) {
    return stepsPt[0];
  }
  const last = depths.length - 1;
  if (depth >= depths[last]) {
    return stepsPt[last];
  }
  let index = 1;
  while (depths[index] < depth) {
    index += 1;
  }
  const d0 = depths[index - 1];
  const d1 = depths[index];
  const s0 = stepsPt[index - 1];
  const s1 = stepsPt[index];
  return Math.round(s0 + ((s1 - s0) * (depth - d0)) / (d1 - d0));
}

/**
 * The dragged row's top, clamped so its centre stays between `min` and `max`
 * (UIKit stops a dragged row with its centre on the table's edge).
 */
export function clampTop(
  top: number,
  height: number,
  min: number,
  max: number,
): number {
  const center = top + height / 2;
  const clamped = Math.min(max, Math.max(min, center));
  return clamped - height / 2;
}
