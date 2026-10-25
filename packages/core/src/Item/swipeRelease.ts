// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file swipeRelease.ts
 * @input The UIKit constants table (motion/uikit/swipeActions.ts)
 * @output Exports resolveRelease (where a swipe-action release lands: closed,
 *   open, or the outermost entry fires), confirmPoint (where a full swipe
 *   confirms) and confirmedOffset, and the interactive-transition driver's
 *   swipe rules (swipeTrackRule, swipeReleaseRule)
 * @position Pure pieces of Item's swipe actions, beside useSwipeAction;
 *   tested by swipeRelease.test.ts against the UIKit lab's releases
 *
 * A UIKit list row fires its outermost action only from a confirmed full
 * swipe: the finger dragged past the confirm point and still past it when it
 * lifts, at any speed. A swipe that confirmed and then backed out closes the
 * row. Any other release goes by its speed first: one at `releaseVelocity`
 * or faster goes the way it moves (open when opening, closed when closing); a
 * slower one goes by where it is, against `openFraction` of the open width.
 * So a flick opens the row even from a short drag and closes it from
 * anywhere, and never fires. Travel and velocity here are logical: measured
 * toward the side being uncovered, whatever the writing direction.
 */

import type {
  ReleaseInput,
  ReleaseOutcome,
  TrackRule,
} from '../motion/interactive';
import {swipeActions} from '../motion/uikit/swipeActions';

/** What a swipe does (Item's `swipeBehavior`). */
export type SwipeReleaseBehavior = 'reveal' | 'commit';

/** Where a release lands. */
export type SwipeRelease = 'closed' | 'open' | 'perform';

/**
 * Where a release lands. `travel` (px, ≥ 0) and `velocity` (px/s) are
 * logical: positive toward the side being uncovered. `isConfirmed`: the
 * finger is past the confirm point as it lifts; `wasConfirmed`: it was at
 * some point during this swipe. A confirmed release fires the outermost
 * entry, whatever its velocity; under `commit` nothing else fires and
 * nothing rests, and a swipe that confirmed and backed out closes either way.
 * Otherwise, under `reveal`, a release at `releaseVelocity` or faster opens
 * the row if it is opening and closes it if it is closing, and a slower one
 * opens it past `openFraction` of its open width and closes it short of that.
 */
export function resolveRelease({
  travel,
  velocity,
  openWidth,
  isConfirmed,
  wasConfirmed,
  behavior,
}: {
  travel: number;
  velocity: number;
  openWidth: number;
  isConfirmed: boolean;
  wasConfirmed: boolean;
  behavior: SwipeReleaseBehavior;
}): SwipeRelease {
  if (isConfirmed) {
    return 'perform';
  }
  if (behavior === 'commit' || wasConfirmed) {
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
 * The swipe at which a full swipe confirms: `confirmFraction` of the way from
 * the open width to the confirmation offset (the row width less
 * `confirmInset`), and never short of the open width.
 */
export function confirmPoint(openWidth: number, rowWidth: number): number {
  const confirmAt = rowWidth - swipeActions.confirmInset;
  return Math.max(
    openWidth,
    openWidth + (confirmAt - openWidth) * swipeActions.confirmFraction,
  );
}

/** The row's offset once a full swipe has confirmed (UIKit's `confirmationThreshold`). */
export function confirmedOffset(rowWidth: number): number {
  return rowWidth - swipeActions.confirmInset;
}

/** A swipe's drag state: whether the full swipe is confirmed, and whether it was at some point. */
export interface SwipeTrack {
  readonly isConfirmed: boolean;
  readonly wasConfirmed: boolean;
}

/** A swipe before the finger has moved. */
export const SWIPE_TRACK_START: SwipeTrack = {
  isConfirmed: false,
  wasConfirmed: false,
};

/**
 * The swipe's track rule, for the interactive-transition driver
 * (motion/interactive.ts). The driver is the row's physical translation, so
 * `finger` and the position are physical px (`sign` × the logical swipe);
 * the rule judges the logical swipe. Past the confirm point, when the
 * outermost entry can fire, the full swipe confirms on the finger's travel
 * and the row runs ahead to the confirmation offset; backed out, it follows
 * the finger again. Either way the row follows on the tracking spring.
 */
export function swipeTrackRule({
  sign,
  confirmAt,
  canConfirm,
  rowWidth,
}: {
  /** +1 when the side's panel is on the physical left, −1 on the right. */
  sign: 1 | -1;
  /** The swipe at which the full swipe confirms (`confirmPoint`). */
  confirmAt: number;
  /** Whether the outermost entry can fire. */
  canConfirm: boolean;
  rowWidth: number;
}): TrackRule<SwipeTrack> {
  return (finger, track) => {
    const swipe = Math.max(0, finger * sign);
    const isConfirmed = canConfirm && swipe >= confirmAt;
    return {
      position:
        sign *
        (isConfirmed ? Math.max(swipe, confirmedOffset(rowWidth)) : swipe),
      state: {isConfirmed, wasConfirmed: track.wasConfirmed || isConfirmed},
      follow: swipeActions.tracking,
    };
  };
}

/** What the swipe's release rule knows besides where the gesture let go. */
export interface SwipeReleaseContext {
  /** +1 when the side's panel is on the physical left, −1 on the right. */
  readonly sign: 1 | -1;
  readonly behavior: SwipeReleaseBehavior;
  readonly openWidth: number;
  /** How far out a row goes when its outermost entry fires (logical px). */
  readonly outTravel: number;
}

/**
 * The swipe's release rule, for the interactive-transition driver: where a
 * release lands (`resolveRelease`, on the finger's travel and the drag's
 * confirmation) as the row's physical translation, on the settle spring. A
 * full swipe slides the row out past its edge.
 */
export function swipeReleaseRule(
  input: ReleaseInput,
  context: SwipeReleaseContext & {readonly track: SwipeTrack},
): ReleaseOutcome<SwipeRelease> {
  const landing = resolveRelease({
    behavior: context.behavior,
    isConfirmed: context.track.isConfirmed,
    wasConfirmed: context.track.wasConfirmed,
    openWidth: context.openWidth,
    travel: Math.max(0, input.finger * context.sign),
    velocity: input.velocity * context.sign,
  });
  const travel =
    landing === 'perform'
      ? context.outTravel
      : landing === 'open'
        ? context.openWidth
        : 0;
  return {
    target: context.sign * travel,
    motion: swipeActions.settle,
    outcome: landing,
  };
}
