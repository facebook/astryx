// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file rideKeyboard.ts
 * @input An animator, target values and a keyboard transition; the UIKit
 *   keyboard spring, the Android keyboard table, resolveMotion
 * @output Exports rideKeyboard: moves an element with the keyboard on the
 *   keyboard's own motion
 * @position Keyboard module (internal to core); what a guide subscriber
 *   calls for each transition (Chat/useChatKeyboard.ts)
 *
 * iOS's keyboard moves on UIKit's keyboard spring and Android's on Gboard's
 * slides up and down (motion/android/keyboard.ts); the transition says which
 * (`curve`). Every ride starts at the transition's start, so content that
 * joins a slide late lands where the keyboard is; a transition that is not
 * animated (a keyboard changing while up) lands at once. Under Reduce Motion
 * nothing travels (design:reduced-motion): the animator's default
 * cross-fades the element to its new place on a touch screen and moves it at
 * once otherwise. A theme retunes the motion through its roles
 * (`springs.keyboard`, `androidKeyboard.showMs` and `showCurve`,
 * `androidKeyboard.hideMs` and `hideCurve`).
 *
 * SYNC: When modified, update /packages/core/src/keyboard/README.md
 */

import type {
  Animator,
  MotionCurve,
  MotionHandle,
  MotionProperty,
  MotionValues,
} from '../motion/animator';
import {keyboard as androidKeyboard} from '../motion/android/keyboard';
import {cubicBezier} from '../motion/bezier';
import {resolveMotion} from '../motion/resolveMotion';
import {springs} from '../motion/uikit/springs';
import type {KeyboardTransition} from './keyboardModel';

/**
 * Moves `animator`'s element to `to` with the keyboard: on its spring or its
 * curve from `transition.start`, or at once when the keyboard jumps.
 *
 * @example
 * ```
 * guide.subscribe(t => rideKeyboard(dock.animator, {y: -lift(t.to)}, t));
 * ```
 */
export function rideKeyboard(
  animator: Animator,
  to: MotionValues,
  transition: KeyboardTransition,
): MotionHandle | null {
  if (!transition.animated) {
    animator.set(to);
    return null;
  }
  // Under Reduce Motion the animator's default applies: no travel (DR1).
  const options = {at: transition.start};
  if (transition.curve == null) {
    return animator.animate(to, {spring: springs.keyboard}, options);
  }
  const element = animator.element;
  const show = transition.kind === 'show';
  const span =
    resolveMotion(element, androidKeyboard, show ? 'showMs' : 'hideMs') / 1000;
  const ease = cubicBezier(
    resolveMotion(element, androidKeyboard, show ? 'showCurve' : 'hideCurve'),
  );
  const curves: Partial<Record<MotionProperty, MotionCurve>> = {};
  for (const [property, target] of Object.entries(to) as [
    MotionProperty,
    number,
  ][]) {
    const from = animator.get(property, transition.start);
    const at = (t: number) =>
      from + (target - from) * ease(Math.min(1, Math.max(0, t / span)));
    curves[property] = {
      duration: span,
      at,
      velocity: t => {
        if (t >= span) {
          return 0;
        }
        const a = Math.max(0, t - 0.001);
        const b = Math.min(span, t + 0.001);
        return (at(b) - at(a)) / (b - a);
      },
    };
  }
  return animator.play(curves, options);
}
