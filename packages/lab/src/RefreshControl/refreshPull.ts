// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file refreshPull.ts
 * @input The UIKit table's refresh-control constants and the rubber band
 *   (@astryxdesign/core/motion/experimental)
 * @output Exports the pull mapping (finger travel → overscroll) and its
 *   inverse, the trigger distance, the reveal, and the release and end
 *   targets of a refresh
 * @position Pure math for RefreshControl; no DOM, no React
 *
 * UIKit's refresh pull, as measured (motion/uikit/refresh.ts in core): the
 * first `height` of overscroll tracks the finger one to one (after the pan's
 * hysteresis, which the pan's translation already leaves out); past it the
 * scroll view's rubber band applies to the excess. The trigger distance grows
 * with the scroll view's height. A trigger within twice the height steps the
 * overscroll back onto the finger, one to one up to twice the height, with
 * resistance past that.
 *
 * SYNC: When modified, update:
 * - /packages/lab/src/RefreshControl/refreshPull.test.ts
 */

import {
  cubicBezier,
  rubberBand,
  rubberBandInverse,
  uikit,
} from '@astryxdesign/core/motion/experimental';

const {refreshControl} = uikit;

/** The refreshing inset and one-to-one stretch, pt. */
export const REFRESH_HEIGHT: number = refreshControl.height;

/**
 * Which mapping a pull follows:
 * - `reveal`: before the trigger: one to one up to `height`, then the rubber
 *   band on the excess;
 * - `band`: after a trigger within twice the height, and for a pull that
 *   starts from the refreshing inset: one to one up to twice the height,
 *   then the rubber band from there.
 */
export type PullMode = 'reveal' | 'band';

function linearStretch(mode: PullMode): number {
  return mode === 'band'
    ? refreshControl.height * refreshControl.postTriggerLinearHeights
    : refreshControl.height;
}

/**
 * Overscroll shown for `travel` px of pull (the pan's translation, which
 * already leaves out its hysteresis). `dimension` is the scroll owner's
 * height, the rubber band's dimension.
 */
export function pullOverscroll(
  travel: number,
  dimension: number,
  mode: PullMode,
): number {
  if (!(travel > 0)) {
    return 0;
  }
  const linear = linearStretch(mode);
  if (travel <= linear) {
    return travel;
  }
  return linear + rubberBand(travel - linear, dimension);
}

/**
 * The travel that shows `overscroll`: where a finger landing on content
 * already pulled (a re-grab mid-settle) resumes without a jump.
 */
export function pullTravel(
  overscroll: number,
  dimension: number,
  mode: PullMode,
): number {
  if (!(overscroll > 0)) {
    return 0;
  }
  const linear = linearStretch(mode);
  if (overscroll <= linear) {
    return overscroll;
  }
  return linear + rubberBandInverse(overscroll - linear, dimension);
}

/**
 * The mapping after a trigger at `travel`: the one-to-one band when the
 * trigger falls within it (the next frame steps onto the finger), the
 * reveal mapping otherwise (a tall scroll view triggers past the band).
 */
export function modeAfterTrigger(travel: number): PullMode {
  return travel <= linearStretch('band') ? 'band' : 'reveal';
}

/**
 * The overscroll at which a pull triggers, for a scroll owner `dimension`
 * tall: a fraction of its height, never below the minimum.
 */
export function triggerDistance(dimension: number): number {
  return Math.max(
    refreshControl.triggerMinimum,
    refreshControl.triggerHeightFraction * Math.max(0, dimension),
  );
}

/** How much of the indicator a pull reveals, 0 to 1 (linear in the pull). */
export function revealFraction(overscroll: number, dimension: number): number {
  return Math.min(1, Math.max(0, overscroll / triggerDistance(dimension)));
}

const revealEasing = cubicBezier(refreshControl.revealCurve);

/** The reveal fraction on UIKit's reveal curve: the indicator's opacity. */
export function revealProgress(overscroll: number, dimension: number): number {
  return revealEasing(revealFraction(overscroll, dimension));
}

/**
 * Where the content comes to rest when the finger lifts: on the refreshing
 * inset while refreshing, back at the top otherwise.
 */
export function releaseTarget(isRefreshing: boolean): number {
  return isRefreshing ? refreshControl.height : 0;
}

/**
 * How an end of a refresh moves the content, given how far the scroll owner
 * is scrolled (`scrolled`, ≥ 0) with the inset still in place. While the gap
 * shows (scrolled less than the inset), the content slides up until the gap
 * closes: the inset animates from `height` to `scrolled`, then the inset and
 * the scroll offset drop together with no visible change. Scrolled past the
 * gap, nothing moves: inset and offset drop at once.
 */
export function endMotion(scrolled: number): {
  animateTo: number | null;
  scrollBy: number;
} {
  const height = refreshControl.height;
  const offset = Math.max(0, scrolled);
  if (offset >= height) {
    return {animateTo: null, scrollBy: -height};
  }
  return {animateTo: offset, scrollBy: -offset};
}
