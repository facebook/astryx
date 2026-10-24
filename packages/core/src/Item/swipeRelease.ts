// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file swipeRelease.ts
 * @input The UIKit constants table (motion/uikit/swipeActions.ts)
 * @output Exports resolveRelease (where a swipe-action release lands: closed,
 *   open, or the outermost entry fires), commitPoint and resistedTravel; and
 *   for the row outside iOS, DEFAULT_SWIPE with its resolveDefaultRelease,
 *   defaultCommitPoint and defaultResistedTravel
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
 *
 * That is iOS's idiom (useTouchIdiom). Outside iOS (Android, any finger
 * outside iOS) the row keeps the swipe it had before (spec AST-057) until a
 * Material variant exists: DEFAULT_SWIPE and the `default` functions below.
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

/**
 * The row's own swipe outside iOS, as it was before UIKit's: a release past
 * the commit point, or a fling, fires; under `reveal` one past half the panel
 * rests open; the settle is CSS's `ease-out` over 200 ms.
 */
export const DEFAULT_SWIPE = {
  /** The commit point: this far past the open width, or `commitFraction` of the row. */
  commitPastPanel: 48,
  commitFraction: 0.5,
  /** Past the commit point the row moves this much per pixel of finger. */
  overshootResistance: 0.35,
  /** Under `reveal`, a release this far into the open width rests open. */
  restFraction: 0.5,
  /** A release this fast (px/s) after this much travel (px) fires. */
  flingVelocity: 600,
  flingMinTravel: 44,
  /** The settle, the slide-out and the spring back. */
  settleMs: 200,
  /** CSS `ease-out`. */
  settleCurve: [0, 0, 0.58, 1] as const,
  /** How far past the row's width it slides out. */
  slideOutOvershoot: 24,
} as const;

/**
 * Where a release lands outside iOS: past the commit point, or on a fling of
 * `flingVelocity` after `flingMinTravel`, the outermost entry fires; under
 * `reveal` a release past `restFraction` of the open width rests open; any
 * other release closes. Logical px and px/s, as resolveRelease.
 */
export function resolveDefaultRelease({
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
  if (
    travel >= commitAt ||
    (velocity >= DEFAULT_SWIPE.flingVelocity &&
      travel >= DEFAULT_SWIPE.flingMinTravel)
  ) {
    return 'perform';
  }
  return behavior === 'reveal' &&
    travel >= openWidth * DEFAULT_SWIPE.restFraction
    ? 'open'
    : 'closed';
}

/** The commit point outside iOS. */
export function defaultCommitPoint(
  openWidth: number,
  rowWidth: number,
): number {
  return Math.max(
    openWidth + DEFAULT_SWIPE.commitPastPanel,
    rowWidth * DEFAULT_SWIPE.commitFraction,
  );
}

/** The row's travel for the finger's outside iOS. */
export function defaultResistedTravel(raw: number, commitAt: number): number {
  return raw <= commitAt
    ? raw
    : commitAt + (raw - commitAt) * DEFAULT_SWIPE.overshootResistance;
}
