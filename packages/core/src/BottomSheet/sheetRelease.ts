// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sheetRelease.ts
 * @input The UIKit constants table (`sheet.release`, the sheet springs) and
 *   the motion foundation's snap-point projection
 * @output Exports resolveSheetRelease, which says where a released sheet goes
 *   and on which spring, and the SheetRelease type
 * @position Internal to BottomSheet; pure (no DOM, no React). Called by
 *   useSheetGestures when a drag ends.
 *
 * A released sheet goes where UISheetPresentationController sends it: to the
 * position nearest its release offset projected `sheet.release
 * .projectionSeconds` ahead at the release velocity, with the dismissed
 * position (the sheet fully below the screen) counting as one of the
 * positions. A slow release projects onto itself, so it lands on whatever is
 * nearest; at rest the sheet dismisses once it is more than halfway from its
 * shortest detent to gone. Nothing restricts the direction: a sheet released
 * just above a detent while moving up, but slowly, falls back to it.
 *
 * The sheet gets there on UIKit's release spring, picked by the release speed
 * alone (`sheet.release.fastSpeed`), and starting at the finger's velocity.
 *
 * Offsets are px down from the tallest detent (0 = fully open), velocities
 * px/s with positive meaning downward, as useSheetGestures measures them.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/BottomSheet/sheetRelease.test.ts
 * - /packages/core/src/BottomSheet/useSheetGestures.ts
 */

import {selectSnapPoint} from '../motion/projection';
import type {SpringDescription} from '../motion/spring';
import {sheet, springs} from '../motion/uikit';

export interface SheetRelease {
  /** A detent to settle on, or a dismissal. */
  kind: 'detent' | 'dismiss';
  /** Index into the detents passed in; -1 for a dismissal. */
  index: number;
  /** Where the sheet goes: the detent's offset, or the dismissed offset. */
  offset: number;
  /** The projected rest offset the choice was made from. */
  projected: number;
  /** The spring that takes it there, handed the release velocity. */
  spring: SpringDescription;
}

/** The deceleration rate whose projection reaches `seconds` of the velocity. */
function rateForProjection(seconds: number): number {
  // WWDC18's projection coasts (v / 1000) · r / (1 − r): r / (1 − r) = 1000·τ.
  const ms = seconds * 1000;
  return ms / (1 + ms);
}

const PROJECTION_RATE = rateForProjection(sheet.release.projectionSeconds);

/**
 * Where a sheet released at `position` moving at `velocity` settles, and on
 * which spring.
 *
 * @example
 * ```
 * // Detents at 0 (open) and 300 px; gone at 640 px. Released at 420 px
 * // moving down at 1200 px/s: projected 552 px, nearer gone than 300.
 * resolveSheetRelease({
 *   detents: [0, 300],
 *   dismissedOffset: 640,
 *   position: 420,
 *   velocity: 1200,
 * }); // {kind: 'dismiss', offset: 640, spring: springs.sheetDismissSwipe, …}
 * ```
 */
export function resolveSheetRelease({
  detents,
  dismissedOffset,
  position,
  velocity,
}: {
  /** Detent offsets, ascending (the tallest first). */
  detents: ReadonlyArray<number>;
  /** The offset at which the sheet is fully off screen; null when a drag may not dismiss it. */
  dismissedOffset: number | null;
  position: number;
  velocity: number;
}): SheetRelease {
  if (detents.length === 0) {
    throw new RangeError('resolveSheetRelease needs at least one detent');
  }
  const positions =
    dismissedOffset == null ? [...detents] : [...detents, dismissedOffset];
  const choice = selectSnapPoint(positions, {
    position,
    velocity,
    rate: PROJECTION_RATE,
  });
  const isFast = Math.abs(velocity) >= sheet.release.fastSpeed;
  if (dismissedOffset != null && choice.index === detents.length) {
    return {
      kind: 'dismiss',
      index: -1,
      offset: dismissedOffset,
      projected: choice.projected,
      spring: isFast ? springs.sheetDismissSwipe : springs.sheetDetent,
    };
  }
  return {
    kind: 'detent',
    index: choice.index,
    offset: choice.value,
    projected: choice.projected,
    spring: isFast ? springs.sheetReleaseFast : springs.sheetDetent,
  };
}
