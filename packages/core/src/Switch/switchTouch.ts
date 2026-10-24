// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file switchTouch.ts
 * @input The UIKit switch constants (motion/uikit/switch.ts) and a track size
 * @output Exports the pure model of Switch's touch presentation: the thumb
 *   geometry scaled to a track, the drag's thumb target, the flip rule, the
 *   commit on release and when the lifted thumb may settle
 * @position Pure half of Switch's touch presentation; driven by
 *   useSwitchTouch.ts, tested by switchTouch.test.ts without a browser
 *
 * UISwitch on iOS 26.2 is the reference (see motion/uikit/switch.ts):
 *
 * - The thumb is a capsule of constant size. UIKit's proportions (a 37 × 24
 *   thumb in a 63 × 28 track) are applied to whatever box the track has, so
 *   the touch presentation keeps the component's sizes.
 * - Positions are offsets of the thumb from its off end, 0 … `travel`, in the
 *   writing direction; the caller mirrors them for right-to-left.
 * - A drag moves the thumb's TARGET with the finger's translation since it
 *   landed, rubber-banded past either end; the thumb chases the target on a
 *   spring (the caller animates that).
 * - The switch flips by the finger: once it is more than `flipDistance` (the
 *   track width minus the thumb width) from where it landed toward the other
 *   end, the next touch event shows the other side; coming back past where
 *   it landed shows the starting side again. Flips happen on events only.
 * - A release commits the side the drag shows if it ever flipped, or toggles
 *   when it flipped nothing (a tap, a hold, a slide off, a short drag).
 *
 * SYNC: When modified, update useSwitchTouch.ts and switchTouch.test.ts.
 */

import {rubberBandClamp, rubberBandUnclamp} from '../motion/rubberBand';
import {switchControl} from '../motion/uikit/switch';

export interface SwitchTouchGeometry {
  readonly trackWidth: number;
  readonly trackHeight: number;
  /** The thumb at rest, px. */
  readonly thumbWidth: number;
  readonly thumbHeight: number;
  /** Gap between the thumb and the track's top, bottom and nearer end, px. */
  readonly inset: number;
  /** Offset of the thumb at the on end, px. */
  readonly travel: number;
  /** Scale of the lifted thumb. */
  readonly liftScaleX: number;
  readonly liftScaleY: number;
  /** The drag's rubber-band dimension, px. */
  readonly rubberBandDimension: number;
  /** How far the finger goes toward the other end before a flip, px. */
  readonly flipDistance: number;
}

const [UIKIT_TRACK_WIDTH, UIKIT_TRACK_HEIGHT] = switchControl.trackSize;
const [UIKIT_THUMB_WIDTH, UIKIT_THUMB_HEIGHT] = switchControl.thumbSize;
const [LIFTED_WIDTH, LIFTED_HEIGHT] = switchControl.liftedThumbSize;

/** UIKit's thumb geometry, in proportion to a track of this size. */
export function switchTouchGeometry(
  trackWidth: number,
  trackHeight: number,
): SwitchTouchGeometry {
  const thumbHeight = (trackHeight * UIKIT_THUMB_HEIGHT) / UIKIT_TRACK_HEIGHT;
  const thumbWidth = (trackWidth * UIKIT_THUMB_WIDTH) / UIKIT_TRACK_WIDTH;
  const inset = (trackHeight - thumbHeight) / 2;
  return {
    trackWidth,
    trackHeight,
    thumbWidth,
    thumbHeight,
    inset,
    travel: Math.max(0, trackWidth - thumbWidth - 2 * inset),
    liftScaleX: LIFTED_WIDTH / UIKIT_THUMB_WIDTH,
    liftScaleY: LIFTED_HEIGHT / UIKIT_THUMB_HEIGHT,
    rubberBandDimension:
      (switchControl.rubberBand.dimension * trackHeight) / UIKIT_TRACK_HEIGHT,
    flipDistance: (switchControl.flipDistance * trackWidth) / UIKIT_TRACK_WIDTH,
  };
}

/**
 * Where the drag puts the thumb's target: the offset it had when the finger
 * landed moved by the finger's translation along the writing direction,
 * rubber-banded past either end.
 *
 * `start` is the thumb's offset on screen when the finger landed (it may be
 * mid-flight, or banded); it is unbanded first, so a finger that grabs a
 * moving thumb continues from where the thumb is, without a jump.
 */
export function dragTarget(
  start: number,
  translation: number,
  geometry: SwitchTouchGeometry,
): number {
  const {travel, rubberBandDimension} = geometry;
  const coefficient = switchControl.rubberBand.coefficient;
  const raw =
    rubberBandUnclamp(start, 0, travel, rubberBandDimension, coefficient) +
    translation;
  return rubberBandClamp(raw, 0, travel, rubberBandDimension, coefficient);
}

/** A drag's flip state: the side it shows and how it got there. */
export interface SwitchFlip {
  /** The value when the finger landed. */
  readonly startedOn: boolean;
  readonly isVisuallyOn: boolean;
  /** The finger passed `flipDistance` on the last event: the next one flips. */
  readonly isArmed: boolean;
  /** The drag has flipped at least once. */
  readonly didFlip: boolean;
}

export function startFlip(isOn: boolean): SwitchFlip {
  return {startedOn: isOn, isVisuallyOn: isOn, isArmed: false, didFlip: false};
}

/**
 * One touch event of the drag. `translation` is the finger's travel since it
 * landed along the writing direction (positive toward the on end).
 */
export function stepFlip(
  flip: SwitchFlip,
  translation: number,
  geometry: SwitchTouchGeometry,
): SwitchFlip {
  // Travel toward the other end: right from off, left from on.
  const toward = flip.startedOn ? -translation : translation;
  if (flip.isVisuallyOn !== flip.startedOn) {
    return toward < 0
      ? {...flip, isVisuallyOn: flip.startedOn, isArmed: false}
      : flip;
  }
  const isPast = toward >= geometry.flipDistance;
  if (flip.isArmed && isPast) {
    return {
      ...flip,
      isVisuallyOn: !flip.startedOn,
      isArmed: false,
      didFlip: true,
    };
  }
  return isPast === flip.isArmed ? flip : {...flip, isArmed: isPast};
}

/**
 * What a release commits: the side a drag flipped to, or the other side of
 * the value when nothing flipped during the gesture.
 */
export function commitOnRelease(
  flip: SwitchFlip | null,
  isOn: boolean,
): boolean {
  return flip?.didFlip === true ? flip.isVisuallyOn : !isOn;
}

/**
 * When the lifted thumb may settle, on the document timeline (ms): at the
 * release, but never sooner than `minimumLiftMs` after the lift began.
 */
export function settleTime(releaseTime: number, liftTime: number): number {
  return Math.max(releaseTime, liftTime + switchControl.minimumLiftMs);
}
