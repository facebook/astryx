// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file toastSwipe.ts
 * @input The Toast constants of the UIKit table (motion/uikit/toast) and the
 *   cubic-bézier timing function (motion/bezier)
 * @output Pure math for Toast's presentation under a finger: how far the card follows a
 *   finger, whether a release dismisses, and the retract it leaves by
 * @position Internal; used by useToastBannerSwipe.ts and unit-tested on its own
 *
 * Distances are CSS px measured from rest toward the toast's edge (up for a
 * top toast, down for a bottom toast), so they are positive in both
 * placements; velocities are px/s in the same direction.
 *
 * SYNC: When modified, update /packages/core/src/Toast/toastSwipe.test.ts
 */

import type {MotionCurve} from '../motion/animator';
import {cubicBezier, type BezierPoints} from '../motion/bezier';
import {toast} from '../motion/uikit/toast';

/**
 * Where the card sits for a finger that travelled `fingerTravel` toward the
 * edge since touch-down: still until `toast.followFrom`, then at
 * `toast.followRatio` of the finger.
 */
export function followOffset(fingerTravel: number): number {
  return toast.followRatio * Math.max(0, fingerTravel - toast.followFrom);
}

/**
 * Whether a release dismisses: the card is at least `toast.dismissOffset`
 * out, or the finger was moving toward the edge at `toast.flickVelocity` or
 * faster when it lifted, by the shared release filter (`spec:AST-100`: a
 * finger that rested past the stillness interval before the lift reads no
 * speed).
 */
export function isDismissRelease(offset: number, velocity: number): boolean {
  return offset >= toast.dismissOffset || velocity >= toast.flickVelocity;
}

/** How far past its edge a retracting card ends: clear of its shadow. */
export const RETRACT_CLEARANCE = 16;

/**
 * Where a retracting card ends, as its translation (px, down positive):
 * fully past its edge. `box` is the card's untranslated box in viewport px;
 * `direction` is 1 for a bottom toast, -1 for a top one.
 */
export function retractTarget(
  box: {readonly top: number; readonly bottom: number},
  viewportHeight: number,
  direction: 1 | -1,
): number {
  return direction === -1
    ? -(box.bottom + RETRACT_CLEARANCE)
    : viewportHeight - box.top + RETRACT_CLEARANCE;
}

/**
 * The retract as a curve the animator plays: from `from` to `to` (px) over
 * `durationMs` on the timing curve `points`, starting at rest (the banner's
 * exit is no continuation of the finger's speed).
 */
export function retractCurve(
  from: number,
  to: number,
  durationMs: number,
  points: BezierPoints,
): MotionCurve {
  const ease = cubicBezier(points);
  const duration = Math.max(durationMs, 1) / 1000;
  const progress = (t: number) => Math.min(1, Math.max(0, t / duration));
  const at = (t: number) => from + (to - from) * ease(progress(t));
  const step = duration / 1000;
  return {
    duration,
    at,
    velocity: t => {
      const a = Math.max(0, t - step);
      const b = Math.min(duration, t + step);
      return (at(b) - at(a)) / (b - a);
    },
  };
}
