// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pressDim.ts
 * @input An element, the opacity to fade it to, a clock (duration and
 *   cubic-bezier curve), and whether the fade answers a touch release; the
 *   element's shared animator (`animatorFor`)
 * @output fadePressDim: fades the element's opacity from what it shows now to
 *   the target on the clock, through the element's animator; stopPressDim:
 *   drops a dim at once
 * @position Internal to core, beside the press machine (pressFeedback.ts):
 *   the press machine decides WHEN content dims, this plays the fade, as UIKit
 *   dims a pressed segment's title. One job, plain inputs; no component names.
 *   Not exported from core's entry points (`architecture:public-component-api`
 *   INV12).
 *
 * The fade is a curve the element's animator plays (`animatorFor(element)`),
 * so it runs on the compositor, starts from the opacity on screen (a dim that
 * moves mid-fade never jumps), shares the element's one animator with any
 * other motion on it, and takes the animator's Reduce Motion policy
 * (`design:reduced-motion` DR2-DR4; `touchRelease` says the change starts
 * from a touch's release). Back at 1, the animator hands the element to its
 * own style.
 *
 * SYNC: When modified, update /packages/core/src/utils/pressDim.test.ts
 */

import {animatorFor, type MotionCurve} from '../motion/animator';
import {cubicBezier, type BezierPoints} from '../motion/bezier';

/** A dim's clock: how long it takes and its cubic-bezier curve. */
export interface PressDimClock {
  readonly durationMs: number;
  readonly curve: BezierPoints;
}

/** Seconds either side of `t` the velocity is read across. */
const VELOCITY_STEP_S = 1 / 1000;

/** The opacity curve from `from` to `to` on `clock`. */
function dimCurve(from: number, to: number, clock: PressDimClock): MotionCurve {
  const duration = clock.durationMs / 1000;
  const ease = cubicBezier(clock.curve);
  const at = (t: number) =>
    duration === 0
      ? to
      : from + (to - from) * ease(Math.min(1, Math.max(0, t / duration)));
  return {
    duration,
    at,
    velocity: t =>
      (at(t + VELOCITY_STEP_S) - at(t - VELOCITY_STEP_S)) /
      (2 * VELOCITY_STEP_S),
  };
}

/**
 * Fades `element`'s opacity to `to` on `clock`, from the opacity it shows
 * now, through its animator; a new fade replaces the one running.
 */
export function fadePressDim(
  element: HTMLElement,
  to: number,
  clock: PressDimClock,
  {touchRelease = false}: {touchRelease?: boolean} = {},
): void {
  const animator = animatorFor(element);
  animator.play(
    {opacity: dimCurve(animator.get('opacity'), to, clock)},
    {touchRelease},
  );
}

/** The opacity `element`'s dim shows now: 1 when it is at rest or undimmed. */
export function shownPressDim(element: HTMLElement): number {
  return animatorFor(element).get('opacity');
}

/** Drops `element`'s dim at once; its own style shows again. */
export function stopPressDim(element: HTMLElement): void {
  animatorFor(element).set({opacity: 1}, {promote: false});
}
