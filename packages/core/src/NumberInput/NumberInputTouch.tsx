// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file NumberInputTouch.tsx
 * @input NumberInput's stepping state and its stepper buttons; the gesture
 *   system's PressTracker (usePressTracker), stepperTracking.ts and the UIKit
 *   constants (motion/uikit/stepper.ts, UIKIT_GESTURES)
 * @output The steppers' touch layer: useStepperTouch, which tracks a finger or
 *   a pen as UIStepper tracks one (a tap steps at the lift, a held half
 *   repeats on UIKit's cadence, a slide carries it to the other half, the
 *   touched half paints at once) through the column's press tracker, which
 *   keeps a delivered press's touch from the page's pan
 * @position NumberInput's one touch module, imported only by NumberInput.tsx,
 *   so a desktop build can swap it out whole
 *
 * A finger or a pen on the steppers, on every touch device, is tracked here;
 * a mouse keeps the button's click. The press paints the half under the
 * finger at once and clears at once, as UIKit's does; inside a scroll view
 * it waits for the content-touch delay, and a scroll that takes the touch
 * cancels it. While a finger is down, the gesture host keeps text selection
 * and the touch callout off the press-tracked column.
 *
 * SYNC: Keep in step with NumberInput.tsx (its stepper click asks
 * `takeTrackedClick`) and NumberInput.stepperTouch.test.tsx.
 */

import {useEffect, useRef, useState, type RefObject} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {
  paintPress,
  readPressPaint,
  usePressTracker,
  type PointerKind,
  type PressTracker,
  type UsePressTrackerOptions,
} from '../gestures';
import {UIKIT_GESTURES} from '../motion/uikit/gestures';
import {stepper} from '../motion/uikit/stepper';
import {StepperTracking, type StepperHalf} from './stepperTracking';

/** What the touch layer reads from NumberInput, current at every render. */
export interface StepperTouchState {
  stepValue: (direction: 1 | -1) => void;
  canIncrement: boolean;
  canDecrement: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
}

export interface StepperTouch {
  /**
   * Whether a stepper click follows a finger or a pen tracked here, which has
   * stepped already, at its lift or while held, so the click is no step of
   * its own. Every click ends the tracked press.
   */
  takeTrackedClick: (
    click: MouseEvent,
    pressPointerType: string | null,
  ) => boolean;
}

/** Tracks a finger or a pen on the steppers as UIStepper tracks one. */
export function useStepperTouch(
  state: StepperTouchState,
  incrementRef: RefObject<HTMLButtonElement | null>,
  decrementRef: RefObject<HTMLButtonElement | null>,
  columnRef: RefObject<HTMLDivElement | null>,
): StepperTouch {
  // The column's tracker, for the paint its control events read.
  const trackerRef = useRef<PressTracker | null>(null);
  const trackedPressRef = useRef(false);
  const pressRef = useRef<{
    pointerType: PointerKind | null;
    downTime: number;
    isDelayed: boolean;
    /** Client y where the decrement half begins, read once at touch-down. */
    split: number;
    /** The half under the finger, kept through the lift for a quick tap's flash. */
    half: StepperHalf | null;
    /** Let go of because the field turned disabled or read-only mid-press. */
    isReleased: boolean;
  }>({
    pointerType: null,
    downTime: 0,
    isDelayed: false,
    split: Number.POSITIVE_INFINITY,
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
          if (
            latest.isDisabled ||
            latest.isReadOnly ||
            (half === 'increment' ? !latest.canIncrement : !latest.canDecrement)
          ) {
            return false;
          }
          latest.stepValue(half === 'increment' ? 1 : -1);
          return true;
        },
      }),
  );
  useEffect(() => () => tracking.dispose(), [tracking]);

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

  // A field turned disabled or read-only during a press lets go of it at once
  // (PressTracker reads isEnabled only when a touch begins): no pressed paint
  // beside aria-disabled and no repeat timer, until the next touch.
  const wasBlockedRef = useRef(false);
  useIsomorphicLayoutEffect(() => {
    const isBlocked = state.isDisabled || state.isReadOnly;
    if (isBlocked && !wasBlockedRef.current) {
      const press = pressRef.current;
      press.isReleased = true;
      press.half = null;
      tracking.cancel();
      paint(null);
    }
    wasBlockedRef.current = isBlocked;
  });

  const options: UsePressTrackerOptions = {
    trackingExpansion: stepper.tracking.expansion,
    // Once a press is delivered the finger's touch stays the stepper's, as a
    // scroll view never cancels a tracking UIControl: a slide onto the other
    // half is not the page's pan. (A scroll that starts on the column waits
    // on the main thread for it.)
    keepsTouch: true,
    isEnabled: () =>
      !latestRef.current.isDisabled && !latestRef.current.isReadOnly,
    onControlEvent: (event, touch) => {
      const press = pressRef.current;
      if (event === 'touchDown') {
        press.pointerType = touch.pointerType;
        press.isReleased = false;
        if (touch.pointerType === 'mouse') {
          return;
        }
        // The one layout read of the press.
        press.split =
          decrementRef.current?.getBoundingClientRect().top ??
          Number.POSITIVE_INFINITY;
        press.downTime = touch.time;
        // PressTracker's control profile delays a finger's highlight inside a
        // scroll view; the press reaches the stepper when it lights.
        press.isDelayed =
          touch.pointerType === 'touch' &&
          touch.scroll?.isInsideScroller === true;
        press.half = touch.y < press.split ? 'increment' : 'decrement';
        trackedPressRef.current = true;
        tracking.begin(press.half);
        return;
      }
      if (press.pointerType === 'mouse') {
        return;
      }
      if (press.isReleased) {
        // Let go when the field turned disabled or read-only: nothing tracks
        // or paints until the next touch. (No click follows a cancelled touch.)
        if (event === 'touchCancel') {
          trackedPressRef.current = false;
        }
        return;
      }
      const isInside =
        event === 'touchDragInside' ||
        event === 'touchDragEnter' ||
        event === 'touchUpInside';
      const half: StepperHalf | null = !isInside
        ? null
        : touch.y < press.split
          ? 'increment'
          : 'decrement';
      if (event === 'touchCancel') {
        // No click follows a touch a scroll or the system took. (One lifted
        // off the column can still get its click, so that one keeps the flag.)
        trackedPressRef.current = false;
        tracking.cancel();
        press.half = null;
      } else if (event === 'touchUpInside' || event === 'touchUpOutside') {
        press.half = half;
        tracking.end(half);
      } else {
        press.half = half;
        tracking.move(half);
      }
      paint(trackerRef.current?.isHighlighted === true ? press.half : null);
    },
    onHighlightChange: isHighlighted => {
      const press = pressRef.current;
      if (press.pointerType === 'mouse' || press.isReleased) {
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

  const takeTrackedClick = (
    click: MouseEvent,
    pressPointerType: string | null,
  ): boolean => {
    const wasTracked = trackedPressRef.current;
    trackedPressRef.current = false;
    // Which pointer sent the click. Where the engine dispatches clicks as
    // pointer events (Chrome, Firefox) the click names it, and names none
    // ('') for a click no pointer sent: a screen reader's activation, a key,
    // a programmatic click(). Elsewhere the press before it names it, and a
    // click with detail 0 is one no pointer sent. Chrome on Android sends a
    // tap's click with detail 0, so detail alone cannot tell the two apart.
    const clickPointer =
      'pointerType' in click && typeof click.pointerType === 'string'
        ? click.pointerType
        : undefined;
    const isFromFingerOrPen =
      clickPointer === undefined
        ? click.detail > 0 &&
          (pressPointerType === 'touch' || pressPointerType === 'pen')
        : clickPointer === 'touch' || clickPointer === 'pen';
    return wasTracked && isFromFingerOrPen;
  };

  // The hook attaches to the column whenever it is mounted (hasNumberSteppers
  // can turn on after the field mounts, or off and on again).
  const tracker = usePressTracker(columnRef, options);
  useIsomorphicLayoutEffect(() => {
    trackerRef.current = tracker;
  });

  return {takeTrackedClick};
}
