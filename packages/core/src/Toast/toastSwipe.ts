// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file toastSwipe.ts
 * @input The Toast constants of the UIKit table (motion/uikit/toast)
 * @output Pure swipe-to-dismiss math for Toast's touch presentation: how far
 *   the card follows a finger and whether a release dismisses
 * @position Internal; used by useToastGesture.ts and unit-tested on its own
 *
 * Distances are CSS px measured from rest toward the toast's edge (up for a
 * top toast, down for a bottom toast), so they are positive in both
 * placements; velocities are px/s in the same direction.
 *
 * SYNC: When modified, update /packages/core/src/Toast/toastSwipe.test.ts
 */

import {toast} from '../motion/uikit/toast';

/**
 * Where the card sits for a finger that travelled `fingerTravel` since
 * touch-down (positive toward the edge, negative away from it): still until
 * `toast.followFrom`, then at `toast.followRatio` of the finger, either way.
 * Away from the edge the card only stretches: a release there always springs
 * it back (`isDismissRelease`).
 */
export function followOffset(fingerTravel: number): number {
  const past = Math.abs(fingerTravel) - toast.followFrom;
  if (past <= 0) {
    return 0;
  }
  return Math.sign(fingerTravel) * toast.followRatio * past;
}

/**
 * Whether a release dismisses: the card is at least `toast.dismissOffset`
 * out, or the finger was moving toward the edge at `toast.flickVelocity` or
 * faster (UIKit's estimator keeps a stopped finger's last speed).
 */
export function isDismissRelease(offset: number, velocity: number): boolean {
  return offset >= toast.dismissOffset || velocity >= toast.flickVelocity;
}
