// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file searchFieldModel.ts
 * @input The UIKit search table (`search` from
 *   `@astryxdesign/core/motion/uikit`) and core's cubic-bézier curves
 * @output Pure math for SearchField: the active field's width, the targets
 *   of every animated part at rest and while active, and the timed curves
 *   that move them (a UIViewPropertyAnimator's cubic-bézier clock, started
 *   from wherever a part is)
 * @position Model behind lab SearchField (SearchField.tsx); no DOM, no React
 *
 * UIKit activates a search bar on one UIViewPropertyAnimator (0.383 s,
 * cubic-bézier 0.42, 0, 0.58, 1): the field rises by the host's lift and
 * narrows to make room for the glass close button, which slides in from 44
 * pt past its place while it fades in. Cancel runs the same clock back to
 * rest, the close button sliding out at the opacity it has. A change of
 * mind mid-flight adds the turn to the curves on screen, on the whole clock,
 * as UIKit's animations do (the animator's `additive`).
 * The clock and the curve are the search table's internal constants: no
 * theme retunes them (touch motion has no theme surface).
 *
 * SYNC: When modified, update searchFieldModel.test.ts and SearchField.tsx.
 */

import {type MotionCurve} from '@astryxdesign/core/motion/animator';
import {cubicBezier} from '@astryxdesign/core/motion/bezier';
import {search} from '@astryxdesign/core/motion/uikit';

/** The UIKit activation curve as a function of the clock's fraction. */
export const activationEase = cubicBezier(search.activationCurve);

/** The activation's length, s. */
export const ACTIVATION_S = search.activationMs / 1000;

/** An activation's clock and curve. */
export interface ActivationTiming {
  /** The full activation's length, s. */
  readonly seconds: number;
  /** The curve, as a function of the clock's fraction. */
  readonly ease: (x: number) => number;
}

/** The activation's clock and curve: UIKit's 383 ms ease-in-ease-out. */
export function activationTiming(): ActivationTiming {
  return {seconds: ACTIVATION_S, ease: activationEase};
}

/**
 * The active field's width beside the close button, from its resting width
 * (both px): the field gives up the close button and the gap before it.
 */
export function activeFieldWidth(restWidth: number): number {
  return Math.max(
    0,
    restWidth - search.stacked.closeGap - search.stacked.closeSize,
  );
}

/** Values of the animated parts at one end of the activation. */
export interface SearchFieldPose {
  /** The whole field's rise, px (negative is up). */
  y: number;
  /** The field background's stretchable middle, as a fraction of its width. */
  middleScale: number;
  /** The field's trailing end (its end cap and clear button), px. */
  endX: number;
  /** The close button's offset from its place, px. */
  closeX: number;
  /** The close button's opacity. */
  closeOpacity: number;
}

export interface SearchFieldGeometry {
  /** The field's resting width, px. */
  restWidth: number;
  /** The field's height, px: its rounded ends are half of it each. */
  height: number;
  /** How far the host lifts the active field, px (0: it stays put). */
  lift: number;
  /** Right-to-left: the trailing end is on the left. */
  isRtl: boolean;
}

/** Where each part rests while inactive (`isActive` false) or active. */
export function poseFor(
  isActive: boolean,
  {restWidth, height, lift, isRtl}: SearchFieldGeometry,
): SearchFieldPose {
  const direction = isRtl ? -1 : 1;
  if (!isActive) {
    return {
      y: 0,
      middleScale: 1,
      endX: 0,
      closeX: direction * search.stacked.closeTravel,
      closeOpacity: 0,
    };
  }
  const activeWidth = activeFieldWidth(restWidth);
  const middle = Math.max(1, restWidth - height);
  return {
    y: -lift,
    middleScale: Math.max(0, activeWidth - height) / middle,
    endX: -direction * (restWidth - activeWidth),
    closeX: 0,
    closeOpacity: 1,
  };
}

/**
 * A timed move from `from` to `to` on the activation curve (or `ease`) over
 * `duration` seconds, as a curve the animator plays.
 */
export function easedCurve(
  from: number,
  to: number,
  duration: number,
  ease: (x: number) => number = activationEase,
): MotionCurve {
  const delta = to - from;
  const step = 1e-4;
  return {
    duration,
    at(t) {
      if (duration <= 0) {
        return to;
      }
      return from + delta * ease(Math.min(1, Math.max(0, t / duration)));
    },
    velocity(t) {
      if (duration <= 0 || delta === 0) {
        return 0;
      }
      const x = Math.min(1, Math.max(0, t / duration));
      const lo = Math.max(0, x - step);
      const hi = Math.min(1, x + step);
      return (delta * (ease(hi) - ease(lo))) / (hi - lo) / duration;
    },
  };
}

/**
 * Holds `from` for `duration` seconds, then is `to`: how the close button's
 * opacity ends a cancel (it slides out at the opacity it has and is removed
 * at the end).
 */
export function heldCurve(
  from: number,
  to: number,
  duration: number,
): MotionCurve {
  return {
    duration,
    at: t => (t >= duration ? to : from),
    velocity: () => 0,
  };
}
