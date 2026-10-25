// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file NumberInputTouch.tsx
 * @input NumberInput's stepping state and its stepper buttons; the gesture
 *   system's PressTracker (usePressTracker), stepperTracking.ts and the UIKit
 *   constants (motion/uikit/gestures.ts)
 * @output The steppers' press layer: useStepperTouch, which tracks a press on
 *   the steppers by any pointer (a tap steps at the lift, a held half
 *   repeats on one steady ramp, a slide carries it to the other half, the
 *   pressed half paints at once) through the column's press tracker, shows
 *   the stepping value while the press lasts and commits it once, at the
 *   release
 * @position NumberInput's one touch module, imported only by NumberInput.tsx,
 *   so a desktop build can swap it out whole
 *
 * A finger, a pen or a mouse on the steppers is tracked here; a keyboard or
 * assistive technology activates a stepper through its click. The press
 * paints the half under the pointer at once and clears at once; inside a
 * scroll view a finger waits for the content-touch delay, and a scroll that
 * takes the touch before then cancels it; once delivered, the press keeps
 * its touch from the page's pan. While a finger is down, the gesture host
 * keeps text selection and the touch callout off the column: the held
 * stepper's lock (`keepsTouch`; `spec:AST-094` FR41, proposed in #8454).
 *
 * While a press steps, the field shows the stepping value and `onChange` is
 * not called; at the release it is called once, with the final value, and
 * the field then shows whatever value the parent passes back. A press the
 * system takes, or one the field turns disabled or read-only under, commits
 * nothing.
 *
 * SYNC: Keep in step with NumberInput.tsx (its stepper click asks
 * `takeTrackedClick`) and NumberInput.stepperTouch.test.tsx.
 */

import {useEffect, useRef, useState, type RefObject} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {
  browserClock,
  paintPress,
  readPressPaint,
  usePressTracker,
  type PressTracker,
  type UsePressTrackerOptions,
} from '../gestures';
import {UIKIT_GESTURES} from '../motion/uikit/gestures';
import {StepperTracking, type StepperHalf} from './stepperTracking';

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
}

export interface StepperTouch {
  /**
   * Whether a stepper click is the one a tracked press gets after its lift,
   * which stepped already, so the click is no step of its own. Every click
   * ends the wait for it.
   */
  takeTrackedClick: (click: MouseEvent) => boolean;
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
  // When the last tracked press lifted; null while no click is owed to it.
  const liftedAtRef = useRef<number | null>(null);
  // The value the press has stepped to; null before its first step.
  const pressValueRef = useRef<number | null>(null);
  const pressRef = useRef<{
    downTime: number;
    isDelayed: boolean;
    /**
     * Client y where the decrement half begins, read once at touch-down;
     * null with no layout (nothing is laid out to tell the halves apart).
     */
    split: number | null;
    /** The half the press landed on. */
    landedOn: StepperHalf;
    /** The half under the pointer, kept through the lift for a quick tap's flash. */
    half: StepperHalf | null;
    /** Let go of because the field turned disabled or read-only mid-press. */
    isReleased: boolean;
  }>({
    downTime: 0,
    isDelayed: false,
    split: null,
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

  // The half above or below the split; with no layout, the one the press
  // landed on.
  const halfAt = (y: number): StepperHalf => {
    const {split, landedOn} = pressRef.current;
    if (split == null) {
      return landedOn;
    }
    return y < split ? 'increment' : 'decrement';
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
    // No trackingExpansion: the press keeps tracking within the control
    // profile's expanded area (AST-094 FR11), so a pointer trembling over
    // the edge stays on the press. Proposed, pending owner review: UIStepper
    // itself tracks within its frame only (motion/MEASUREMENTS.md).
    //
    // Once a press is delivered the pointer's touch stays the stepper's, as a
    // scroll view never cancels a tracking UIControl: a slide onto the other
    // half is not the page's pan. (A scroll that starts on the column waits
    // on the main thread for it.)
    keepsTouch: true,
    // A mouse holds a stepper the way a finger does, so the tracker attaches
    // where the primary pointer is fine too and reads each event's pointer:
    // the host's per-event-pointer exception (spec:AST-094 FR19), the kind
    // spec:AST-057 grants the row swipe.
    perEventPointer: true,
    isEnabled: () =>
      !latestRef.current.isDisabled && !latestRef.current.isReadOnly,
    onControlEvent: (event, touch) => {
      const press = pressRef.current;
      if (event === 'touchDown') {
        press.isReleased = false;
        liftedAtRef.current = null;
        pressValueRef.current = null;
        // The one layout read of the press.
        const decrementBox = decrementRef.current?.getBoundingClientRect();
        press.split =
          decrementBox == null || decrementBox.height === 0
            ? null
            : decrementBox.top;
        press.downTime = touch.time;
        // PressTracker's control profile delays a finger's highlight inside a
        // scroll view; the press reaches the stepper when it lights.
        press.isDelayed =
          touch.pointerType === 'touch' &&
          touch.scroll?.isInsideScroller === true;
        // The half the press landed on; a press on the column's reach past its
        // halves (its touch target) takes the half above or below the split.
        press.landedOn = halfOf(touch.target) ?? halfAt(touch.y);
        press.half = press.landedOn;
        tracking.begin(press.half);
        return;
      }
      const isLift = event === 'touchUpInside' || event === 'touchUpOutside';
      if (press.isReleased) {
        // Let go of when the field turned disabled or read-only: nothing
        // tracks, paints or commits until the next press.
        liftedAtRef.current = isLift ? browserClock.now() : null;
        return;
      }
      const isInside =
        event === 'touchDragInside' ||
        event === 'touchDragEnter' ||
        event === 'touchUpInside';
      const half: StepperHalf | null = isInside ? halfAt(touch.y) : null;
      if (event === 'touchCancel') {
        // No click follows a touch a scroll or the system took.
        liftedAtRef.current = null;
        tracking.cancel();
        press.half = null;
        discard();
      } else if (isLift) {
        press.half = half;
        liftedAtRef.current = browserClock.now();
        tracking.end(half);
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
            ? press.downTime + UIKIT_GESTURES.press.contentTouchDelay.value
            : press.downTime,
        );
      }
      paint(isHighlighted ? press.half : null);
    },
  };

  const takeTrackedClick = (click: MouseEvent): boolean => {
    const liftedAt = liftedAtRef.current;
    liftedAtRef.current = null;
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
    return (
      isFromPointer &&
      liftedAt != null &&
      browserClock.now() - liftedAt <=
        UIKIT_GESTURES.click.strayClickWindow.value
    );
  };

  // The hook attaches to the column whenever it is mounted (hasNumberSteppers
  // can turn on after the field mounts, or off and on again).
  const tracker = usePressTracker(columnRef, options);
  useIsomorphicLayoutEffect(() => {
    trackerRef.current = tracker;
  });

  return {takeTrackedClick};
}
