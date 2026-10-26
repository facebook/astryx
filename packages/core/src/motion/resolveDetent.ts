// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file resolveDetent.ts
 * @input A release (position and velocity on one axis), the detents it can
 *   land on, and the release policy's thresholds
 * @output Exports resolveDetent: the index of the detent a release lands on,
 *   and the projected rest position it was judged from
 * @position The release policy of the motion foundation, on
 *   `selectSnapPoint` (projection.ts), which stays the math primitive
 *   (projection + nearest). Pure: no DOM, no React. Internal to core: not
 *   exported from the package or any barrel (resolveDetent.test.ts locks
 *   that). A component's release rule calls it with its own detents and
 *   thresholds; this is the one "where does a release land" helper, so a
 *   second one should not be added beside it.
 *
 * - A slow release lands on the detent nearest where it would come to rest:
 *   its position, or, with `projection`, its position plus the distance it
 *   would coast at its velocity (projection.ts). Below
 *   `projection.minSpeed` nothing is projected, so it lands on the detent
 *   nearest where it was let go. A tie goes the way a projected release
 *   moves, and otherwise to the earlier detent (`selectSnapPoint`).
 * - A flick (`flickSpeed` or faster) lands at least on the next detent
 *   beyond its position in the direction it moves, or on the nearest
 *   detent to its projection if that is farther. A detent within
 *   `tolerance` of the position counts as reached, so the flick goes on to
 *   the one after it.
 * - With `start` (where the drag began), a release moving back toward it
 *   cancels to the detent nearest `start`, whatever its travel so far or its
 *   speed.
 * - With `fromIndex` and `maxSteps`, a release lands at most `maxSteps`
 *   detents away from the one at `fromIndex` (a pager's one page per
 *   release).
 *
 * Detents are ascending positions on the axis; velocities are in the same
 * units per second, positive toward larger positions.
 *
 * SYNC: When modified, update resolveDetent.test.ts.
 */

import {selectSnapPoint} from './projection';

/** Where a release lands. */
export interface DetentRelease {
  /** Index into the detents passed in. */
  readonly index: number;
  /** The rest position the choice was judged from (the position without a projection). */
  readonly projected: number;
}

/** A release's projection: how far ahead it is judged, and from what speed. */
export interface DetentProjection {
  /** Seconds of the release velocity the projection reaches. */
  readonly seconds: number;
  /** Below this speed (units/s), nothing is projected (default 0). */
  readonly minSpeed?: number;
}

/** The deceleration rate whose projection reaches `seconds` of the velocity. */
function rateForProjection(seconds: number): number {
  // WWDC18's projection coasts (v / 1000) · r / (1 − r): r / (1 − r) = 1000·τ.
  const ms = seconds * 1000;
  return ms / (1 + ms);
}

/** The index of the detent nearest `position` (the first on a tie). */
function nearestIndex(
  detents: ReadonlyArray<number>,
  position: number,
): number {
  let best = 0;
  for (let i = 1; i < detents.length; i += 1) {
    if (Math.abs(detents[i] - position) < Math.abs(detents[best] - position)) {
      best = i;
    }
  }
  return best;
}

/**
 * The detent a release lands on.
 *
 * @example
 * ```
 * // Detents at 0, 300 and 640 px. Released at 300 px moving toward 640 at
 * // 1200 px/s, a flick: on to 640, although its projection (420 px) is
 * // nearer 300.
 * resolveDetent({
 *   detents: [0, 300, 640],
 *   position: 300,
 *   velocity: 1200,
 *   flickSpeed: 1008,
 *   tolerance: 1,
 *   projection: {seconds: 0.1, minSpeed: 250},
 *   start: 0,
 * }); // {index: 2, projected: 420}
 * ```
 */
export function resolveDetent({
  detents,
  position,
  velocity,
  flickSpeed,
  tolerance = 0,
  projection,
  start,
  fromIndex,
  maxSteps,
}: {
  /** Detent positions, ascending. */
  detents: ReadonlyArray<number>;
  position: number;
  velocity: number;
  /** From this speed (units/s) on, a release is a flick. */
  flickSpeed: number;
  /** A detent this close to the position counts as reached by a flick. */
  tolerance?: number;
  /** Judge a slow release where it would coast to; absent, where it was let go. */
  projection?: DetentProjection;
  /** Where the drag began: a release moving back toward it cancels to it. */
  start?: number;
  /** The detent the release starts from, for `maxSteps`. */
  fromIndex?: number;
  /** At most this many detents away from `fromIndex`. */
  maxSteps?: number;
}): DetentRelease {
  if (detents.length === 0) {
    throw new RangeError('resolveDetent needs at least one detent');
  }
  const projectedVelocity =
    projection == null || Math.abs(velocity) < (projection.minSpeed ?? 0)
      ? 0
      : velocity;
  const choice = selectSnapPoint(detents, {
    position,
    velocity: projectedVelocity,
    rate:
      projection == null ? undefined : rateForProjection(projection.seconds),
    fromIndex,
    maxSteps,
  });
  let index = choice.index;
  if (Math.abs(velocity) >= flickSpeed) {
    // A flick goes at least to the next detent beyond where it is.
    let next = -1;
    if (velocity > 0) {
      next = detents.findIndex(d => d > position + tolerance);
    } else {
      for (let i = detents.length - 1; i >= 0 && next === -1; i -= 1) {
        if (detents[i] < position - tolerance) {
          next = i;
        }
      }
    }
    if (next !== -1 && (velocity > 0 ? next > index : next < index)) {
      index = next;
    }
  }
  if (
    start != null &&
    velocity !== 0 &&
    Math.sign(velocity) === Math.sign(start - position)
  ) {
    index = nearestIndex(detents, start);
  }
  if (fromIndex != null && maxSteps != null) {
    // A stale index past either end counts from the nearest real detent.
    const from = Math.min(Math.max(fromIndex, 0), detents.length - 1);
    index = Math.min(Math.max(index, from - maxSteps), from + maxSteps);
  }
  return {index, projected: choice.projected};
}
