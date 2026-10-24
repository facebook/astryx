// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file swipeRelease.ts
 * @input The UIKit constants table (motion/uikit/swipeActions.ts)
 * @output Exports resolveRelease (where a swipe-action release lands: closed,
 *   open, or the outermost entry fires), commitPoint and resistedTravel
 * @position Pure pieces of Item's swipe actions, beside useSwipeAction;
 *   tested by swipeRelease.test.ts against the UIKit lab's releases
 *
 * A UIKit list row decides a release by its speed first. A release at
 * `releaseVelocity` or faster goes the way it moves: it opens the row when
 * it opens and closes it when it closes, from anywhere short of the commit
 * point. A slower one goes by where it is, against `openFraction` of the
 * open width. So a flick opens the row even from a short drag and closes it
 * from anywhere, and a flick never fires an action: only a release past the
 * commit point does. Travel and velocity here are logical: measured toward
 * the side being uncovered, whatever the writing direction.
 */

import {swipeActions} from '../motion/uikit';

/** What a swipe does (Item's `swipeBehavior`). */
export type SwipeReleaseBehavior = 'reveal' | 'commit';

/** Where a release lands. */
export type SwipeRelease = 'closed' | 'open' | 'perform';

/**
 * Where a release lands. `travel` (px, ≥ 0) and `velocity` (px/s) are
 * logical: positive toward the side being uncovered. A release past the
 * commit point fires the outermost entry, whatever its velocity; under
 * `commit` nothing else fires and nothing rests. Under `reveal` a release at
 * `releaseVelocity` or faster opens the row if it is opening and closes it if
 * it is closing; a slower one opens it past `openFraction` of its open width
 * and closes it short of that.
 */
export function resolveRelease({
  travel,
  velocity,
  openWidth,
  commitAt,
  behavior,
}: {
  travel: number;
  velocity: number;
  openWidth: number;
  commitAt: number;
  behavior: SwipeReleaseBehavior;
}): SwipeRelease {
  if (travel >= commitAt) {
    return 'perform';
  }
  if (behavior === 'commit') {
    return 'closed';
  }
  if (velocity >= swipeActions.releaseVelocity) {
    return 'open';
  }
  if (velocity <= -swipeActions.releaseVelocity) {
    return 'closed';
  }
  return travel >= swipeActions.openFraction * openWidth ? 'open' : 'closed';
}

/**
 * The commit point: `commitPastPanel` past the open width, or
 * `commitFraction` of the row when that is further.
 */
export function commitPoint(openWidth: number, rowWidth: number): number {
  return Math.max(
    openWidth + swipeActions.commitPastPanel,
    rowWidth * swipeActions.commitFraction,
  );
}

/**
 * The row's travel for the finger's: one for one up to the commit point,
 * `overdragResistance` per pixel past it.
 */
export function resistedTravel(raw: number, commitAt: number): number {
  return raw <= commitAt
    ? raw
    : commitAt + (raw - commitAt) * swipeActions.overdragResistance;
}
