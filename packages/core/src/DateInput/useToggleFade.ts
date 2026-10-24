// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

/**
 * @file useToggleFade.ts
 * @input Whether the element shows, React, the motion animator and the UIKit
 *   constants table
 * @output Exports `useToggleFade` (a callback ref that fades its element in
 *   and out on UIDatePicker's month/year toggle clock, on the compositor) and
 *   `toggleFadeCurve` (that fade as a curve)
 * @position Internal hook of TouchDateField.tsx and TouchDateTimeField.tsx
 *
 * UIDatePicker's month/year toggle is one `UIView.animate` of 0.25 s on the
 * default ease-in-ease-out, beginning from the current state
 * (motion/uikit/datePicker.ts `calendar.monthYearToggle`): the wheels fade in
 * as the grid, the weekday row and the chevrons fade out, and a second tap
 * mid-fade turns each fade around from where it is, over a whole 0.25 s.
 *
 * The fades run on F1's animator, with the table's duration and curve, not
 * on a CSS transition. The difference is the start: the render that opens the
 * wheels can hold the main thread (laying out a long year wheel), and a CSS
 * transition is clocked from the style change, so by the first frame it has
 * already run out and the toggle shows as a jump. The animator starts a fade
 * from rest when the browser commits it, as Core Animation does, so a busy
 * commit delays the fade instead of skipping it. Once on screen it runs on the
 * compositor through a blocked main thread.
 *
 * The element's own styles keep `visibility` (hidden once a fade out ends, and
 * out of the accessibility tree) and `inert`; the opacity is the animator's
 * alone, written inline. A fade has no travel, so Reduced Motion keeps it.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DateInput/useToggleFade.test.tsx
 * - /packages/core/src/DateInput/__tests__/MonthYearToggle.interaction.browser.spec.ts
 */

import {useRef} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import type {MotionCurve} from '../motion/animator';
import {cubicBezier} from '../motion/bezier';
import {useAnimator} from '../motion/useAnimator';
import {datePicker} from '../motion/uikit/datePicker';
import {timing} from '../motion/uikit/timing';

const FADE_S = datePicker.calendar.monthYearToggle.fadeMs / 1000;
const ease = cubicBezier(timing.curves.easeInOut);
const STEP = 1e-4;

/**
 * The toggle's fade from `from` to `to`: 0.25 s on the ease-in-ease-out,
 * whatever the distance, as `UIView.animate` with `beginFromCurrentState`
 * runs a whole duration from the value on screen.
 *
 * @example
 * ```
 * toggleFadeCurve(0, 1).at(0.125); // 0.5
 * ```
 */
export function toggleFadeCurve(from: number, to: number): MotionCurve {
  const distance = to - from;
  const progress = (t: number) => ease(Math.min(1, Math.max(0, t / FADE_S)));
  return {
    duration: FADE_S,
    at: t => from + distance * progress(t),
    velocity: t => {
      if (t <= 0 || t >= FADE_S) {
        return 0;
      }
      const before = Math.max(0, t - STEP);
      const after = Math.min(FADE_S, t + STEP);
      return (
        (distance * (progress(after) - progress(before))) / (after - before)
      );
    },
  };
}

/**
 * A callback ref whose element fades to opacity 1 while `isShown`, and to 0
 * otherwise, on the toggle's clock. The first render places it without a
 * fade.
 *
 * @example
 * ```
 * const fadeRef = useToggleFade(isWheelOpen);
 * return <div ref={fadeRef} />;
 * ```
 */
export function useToggleFade(
  isShown: boolean,
): (element: HTMLElement | null) => void {
  const {ref, animator} = useAnimator({initial: {opacity: isShown ? 1 : 0}});
  const shownRef = useRef(isShown);
  useIsomorphicLayoutEffect(() => {
    if (shownRef.current === isShown) {
      return;
    }
    shownRef.current = isShown;
    animator.play({
      opacity: toggleFadeCurve(animator.get('opacity'), isShown ? 1 : 0),
    });
  }, [isShown, animator]);
  return ref;
}
