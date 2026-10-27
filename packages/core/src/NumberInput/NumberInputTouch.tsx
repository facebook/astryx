// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file NumberInputTouch.tsx
 * @input NumberInput's stepping state and its stepper buttons; the gesture
 *   system's PressTracker (usePressTracker) and its selection lock
 *   (gestures/selectionLock.ts), stepperTracking.ts, the UIKit press
 *   constants (motion/uikit/gestures.ts) and the click guard's window
 *   (utils/clickGuard.ts)
 * @output The steppers' press layer: useStepperTouch, which tracks a press on
 *   the steppers (a held half repeats on one steady ramp, a slide carries it
 *   to the other half, the pressed half paints at once), shows the stepping
 *   value while the press lasts and commits it once, at the release, and
 *   tells each stepper click what it steps: a tap's click steps the half the
 *   press lifted on
 * @position NumberInput's one touch module, imported only by NumberInput.tsx,
 *   so a desktop build can swap it out whole
 *
 * Every pointer is tracked through the column's press tracker, which the
 * gesture host serves for a mouse's primary button, a pen and a finger alike
 * (`spec:AST-094` FR43, FR19). A keyboard or assistive technology activates a
 * stepper through its click. A tap steps on the browser's click after its lift, as a
 * control activates (FR11); a press that stepped while held commits at its
 * release, and the click after it adds nothing. The press paints the half
 * under the pointer at once and clears at once; inside a scroll view a finger
 * waits for the content-touch delay, and a scroll that takes the touch
 * before then cancels it; once delivered, the press keeps its touch from the
 * page's pan. A held finger selects no text and opens no callout: the press
 * tracker's selection lock turns both off for that press only and restores
 * them at the lift or a cancel (`spec:AST-094` FR41, a stepper's
 * hold-repeat).
 *
 * While a press steps, the field shows the stepping value and `onChange` is
 * not called; at the release it is called once, with the final value, and
 * the field then shows whatever value the parent passes back. A press the
 * system takes, or one the field turns disabled or read-only under, commits
 * nothing.
 *
 * SYNC: Keep in step with NumberInput.tsx (its stepper clicks ask
 * `takeClick`) and NumberInput.stepperTouch.test.tsx.
 */

import {useEffect, useRef, useState, type RefObject} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {
  browserClock,
  usePressTracker,
  type PressTracker,
  type UsePressTrackerOptions,
} from '../gestures';
import {lockSelection} from '../gestures/selectionLock';
import {UIKIT_PRESS} from '../motion/uikit/gestures';
import {CLICK_GUARD_WINDOW_MS} from '../utils/clickGuard';
import {paintPress, readPressPaint} from '../utils/pressFeedback';
import {halfAt, StepperTracking, type StepperHalf} from './stepperTracking';

/** What the press layer reads from NumberInput, current at every render. */
export interface StepperTouchState {
  /** The value a press steps from: the committed value, or the draft's. */
  valueForStepping: number | null;
  /** One step from `current` toward `direction`; `current` at a bound. */
  stepFrom: (current: number | null, direction: 1 | -1) => number | null;
  /** Shows `value` in the field while a press lasts; null: the committed value. */
  showPressValue: (value: number | null) => void;
  /** Commits a press's final value: `onChange`, once. */
  commitValue: (value: number) => void;
  isDisabled: boolean;
  isReadOnly: boolean;
  /** Whether the steppers are shown (`hasNumberSteppers`). */
  hasSteppers: boolean;
}

/** What a stepper click steps: a half, nothing, or its own half. */
export type StepperClick = StepperHalf | 'none' | 'own';

export interface StepperTouch {
  /**
   * What a stepper click does. The click a tracked press gets after its lift
   * steps the half the press lifted on when it was a tap (`spec:AST-094`
   * FR11), and nothing ('none') when the press stepped while held or lifted
   * outside. Any other click is its own ('own'): a keyboard's, assistive
   * technology's, or one long after the lift. Every click ends the wait.
   */
  takeClick: (click: MouseEvent) => StepperClick;
}

/** Tracks a press on the steppers by any pointer. */
export function useStepperTouch(
  state: StepperTouchState,
  incrementRef: RefObject<HTMLButtonElement | null>,
  decrementRef: RefObject<HTMLButtonElement | null>,
  columnRef: RefObject<HTMLDivElement | null>,
): StepperTouch {
  // The column's tracker, for the paint its control events read.
  const trackerRef = useRef<PressTracker | null>(null);
  // The last lift a click may follow: when, and the half a tap's click steps
  // (null: its click steps nothing). Null while no click is owed.
  const liftRef = useRef<{at: number; tap: StepperHalf | null} | null>(null);
  // The value the press has stepped to; null before its first step.
  const pressValueRef = useRef<number | null>(null);
  const pressRef = useRef<{
    downTime: number;
    isDelayed: boolean;
    /**
     * The halves' centres in client px, read once at touch-down; null with
     * no layout (nothing is laid out to tell the halves apart). A point
     * belongs to the nearer one: the decrement half is below the increment in
     * the column and beside it in the touch control.
     */
    centers: {
      increment: {x: number; y: number};
      decrement: {x: number; y: number};
    } | null;
    /** The half the press landed on. */
    landedOn: StepperHalf;
    /** The half under the pointer, kept through the lift for a quick tap's flash. */
    half: StepperHalf | null;
    /** Let go of because the field turned disabled or read-only mid-press. */
    isReleased: boolean;
  }>({
    downTime: 0,
    isDelayed: false,
    centers: null,
    landedOn: 'increment',
    half: null,
    isReleased: false,
  });
  const latestRef = useRef(state);
  useIsomorphicLayoutEffect(() => {
    latestRef.current = state;
  });
  const [tracking] = useState(
    () =>
      new StepperTracking({
        step: half => {
          const latest = latestRef.current;
          if (latest.isDisabled || latest.isReadOnly) {
            return false;
          }
          const current = pressValueRef.current ?? latest.valueForStepping;
          const next = latest.stepFrom(current, half === 'increment' ? 1 : -1);
          if (next == null || next === current) {
            return false;
          }
          pressValueRef.current = next;
          latest.showPressValue(next);
          return true;
        },
      }),
  );
  useEffect(() => () => tracking.dispose(), [tracking]);

  const halfOf = (target: unknown): StepperHalf | null => {
    if (!(target instanceof Node)) {
      return null;
    }
    if (incrementRef.current?.contains(target) === true) {
      return 'increment';
    }
    return decrementRef.current?.contains(target) === true ? 'decrement' : null;
  };

  // The half nearer the point; with no layout, the one the press landed on.
  const halfUnder = (point: {x: number; y: number}): StepperHalf => {
    const {centers, landedOn} = pressRef.current;
    return centers == null ? landedOn : halfAt(centers, point);
  };

  // The one layout read of a press: each half's centre; null with no layout
  // (nothing is laid out to tell the halves apart).
  const readCenters = (): {
    increment: {x: number; y: number};
    decrement: {x: number; y: number};
  } | null => {
    const boxOf = (button: HTMLButtonElement | null) =>
      button?.getBoundingClientRect() ?? null;
    const incrementBox = boxOf(incrementRef.current);
    const decrementBox = boxOf(decrementRef.current);
    const centerOf = (box: DOMRect) => ({
      x: box.left + box.width / 2,
      y: box.top + box.height / 2,
    });
    return incrementBox == null ||
      decrementBox == null ||
      (decrementBox.width === 0 && decrementBox.height === 0)
      ? null
      : {increment: centerOf(incrementBox), decrement: centerOf(decrementBox)};
  };

  const paint = (half: StepperHalf | null) => {
    for (const [own, button] of [
      ['increment', incrementRef.current],
      ['decrement', decrementRef.current],
    ] as const) {
      const next = half === own ? 'on' : 'none';
      // Only real changes are written: an unchanged write still restyles.
      if (button != null && readPressPaint(button) !== next) {
        paintPress(button, next);
      }
    }
  };

  // The press ended with its lift: what it stepped to is committed, once.
  const commit = () => {
    const value = pressValueRef.current;
    pressValueRef.current = null;
    if (value != null) {
      latestRef.current.commitValue(value);
    }
    latestRef.current.showPressValue(null);
  };

  // The press was taken away: what it stepped to is dropped.
  const discard = () => {
    pressValueRef.current = null;
    latestRef.current.showPressValue(null);
  };

  // A field turned disabled or read-only during a press lets go of it at once
  // (PressTracker reads isEnabled only when a touch begins): no pressed paint
  // beside aria-disabled, no repeat timer and no commit, until the next press.
  const wasBlockedRef = useRef(false);
  useIsomorphicLayoutEffect(() => {
    const isBlocked = state.isDisabled || state.isReadOnly;
    if (isBlocked && !wasBlockedRef.current && tracking.isTracking) {
      const press = pressRef.current;
      press.isReleased = true;
      press.half = null;
      tracking.cancel();
      paint(null);
      discard();
    }
    wasBlockedRef.current = isBlocked;
  });

  const options: UsePressTrackerOptions = {
    // No trackingExpansion of its own: the press keeps tracking within the
    // control profile's area, `UIKIT_CONTROL.trackingExpansion` (70 px past
    // the column), so a pointer trembling over the edge stays on the press.
    // Proposed, pending owner review (M-STP20 in motion/MEASUREMENTS.md):
    // UIStepper itself tracks within its frame only.
    //
    // Once a press is delivered the pointer's touch stays the stepper's, as a
    // scroll view never cancels a tracking UIControl: a slide onto the other
    // half is not the page's pan. (A scroll that starts on the column waits
    // on the main thread for it.)
    keepsTouch: true,
    // A stepper's hold repeats, so its press selects no text and opens no
    // callout, for that press only (`spec:AST-094` FR41).
    selectionLock: lockSelection,
    isEnabled: () =>
      !latestRef.current.isDisabled && !latestRef.current.isReadOnly,
    onControlEvent: (event, touch) => {
      const press = pressRef.current;
      if (event === 'touchDown') {
        press.isReleased = false;
        liftRef.current = null;
        pressValueRef.current = null;
        press.centers = readCenters();
        press.downTime = touch.time;
        // PressTracker's control profile delays a finger's highlight inside a
        // scroll view; the press reaches the stepper when it lights.
        press.isDelayed =
          touch.pointerType === 'touch' &&
          touch.scroll?.isInsideScroller === true;
        // The half the press landed on; a press on the control itself (around
        // or between its halves) takes the nearer half.
        press.landedOn = halfOf(touch.target) ?? halfAt(press.centers, touch);
        press.half = press.landedOn;
        tracking.begin(press.half);
        return;
      }
      const isLift = event === 'touchUpInside' || event === 'touchUpOutside';
      if (press.isReleased) {
        // Let go of when the field turned disabled or read-only: nothing
        // tracks, paints or commits until the next press.
        liftRef.current = isLift ? {at: browserClock.now(), tap: null} : null;
        return;
      }
      const isInside =
        event === 'touchDragInside' ||
        event === 'touchDragEnter' ||
        event === 'touchUpInside';
      const half: StepperHalf | null = isInside ? halfUnder(touch) : null;
      if (event === 'touchCancel') {
        // No click follows a touch a scroll or the system took.
        liftRef.current = null;
        tracking.cancel();
        press.half = null;
        discard();
      } else if (isLift) {
        press.half = half;
        // A tap steps on the click that follows (FR11): the lift only says
        // which half.
        liftRef.current = {at: browserClock.now(), tap: tracking.end(half)};
        commit();
      } else {
        press.half = half;
        tracking.move(half);
      }
      paint(trackerRef.current?.isHighlighted === true ? press.half : null);
    },
    onHighlightChange: isHighlighted => {
      const press = pressRef.current;
      if (press.isReleased) {
        return;
      }
      if (isHighlighted) {
        tracking.deliver(
          press.isDelayed
            ? press.downTime + UIKIT_PRESS.contentTouchDelay.value
            : press.downTime,
        );
      }
      paint(isHighlighted ? press.half : null);
    },
  };

  const takeClick = (click: MouseEvent): StepperClick => {
    const lift = liftRef.current;
    liftRef.current = null;
    // A click a pointer sent. Where the engine dispatches clicks as pointer
    // events it names the pointer: Chrome on Android names a tap's click
    // 'touch' (detail 0), Safari on iOS names it 'mouse' (detail 1). Where
    // clicks name none, detail > 0. A screen reader's activation, a key or a
    // programmatic click() names no pointer ('') and has detail 0.
    const clickPointer =
      'pointerType' in click && typeof click.pointerType === 'string'
        ? click.pointerType
        : undefined;
    const isFromPointer =
      clickPointer === undefined ? click.detail > 0 : clickPointer !== '';
    // A press's click follows its lift at once. One that comes later (after
    // a hold, which the engine sends no click for) is a press of its own.
    if (
      !isFromPointer ||
      lift == null ||
      browserClock.now() - lift.at > CLICK_GUARD_WINDOW_MS
    ) {
      return 'own';
    }
    return lift.tap ?? 'none';
  };

  // A press whose owner goes away mid-hold lets go at once, as a disabled
  // field's does: the steppers unmounting (`hasNumberSteppers` turning
  // false) detach the press tracker, which then sends no end, so nothing else
  // would stop the repeat.
  const hadSteppersRef = useRef(state.hasSteppers);
  useIsomorphicLayoutEffect(() => {
    if (state.hasSteppers !== hadSteppersRef.current && tracking.isTracking) {
      const press = pressRef.current;
      press.isReleased = true;
      press.half = null;
      liftRef.current = null;
      tracking.cancel();
      paint(null);
      discard();
    }
    hadSteppersRef.current = state.hasSteppers;
  });

  // The hook attaches to the column whenever it is mounted (hasNumberSteppers
  // can turn on after the field mounts, or off and on again), for every
  // pointer (`spec:AST-094` FR43).
  const tracker = usePressTracker(columnRef, options);
  useIsomorphicLayoutEffect(() => {
    trackerRef.current = tracker;
  });

  return {takeClick};
}
