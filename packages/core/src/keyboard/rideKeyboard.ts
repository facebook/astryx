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
 * iOS's keyboard moves on UIKit's keyboard spring and Android's keyboard
 * slides on an eased curve; the transition says which (`curve`). Both start
 * at the transition's start and keep moving under Reduce Motion, as the
 * keyboard does. A theme retunes either through its motion roles
 * (`springs.keyboard`, `androidKeyboard.*`).
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
import {keyboard as androidKeyboard} from '../motion/android';
import {cubicBezier} from '../motion/bezier';
import {resolveMotion} from '../motion/resolveMotion';
import {springs} from '../motion/uikit';
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
  const options = {at: transition.start, reducedMotion: 'keep'} as const;
  if (transition.curve == null) {
    return animator.animate(to, {spring: springs.keyboard}, options);
  }
  const element = animator.element;
  const span =
    resolveMotion(element, androidKeyboard, transition.curve.durationKey) /
    1000;
  const ease = cubicBezier(resolveMotion(element, androidKeyboard, 'curve'));
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
