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
 * faster (UIKit's estimator keeps a stopped finger's last speed).
 */
export function isDismissRelease(offset: number, velocity: number): boolean {
  return offset >= toast.dismissOffset || velocity >= toast.flickVelocity;
}
