// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file NumberInputTouch.tsx
 * @input NumberInput's stepping state and its stepper buttons; the gesture
 *   system's PressTracker (usePressTracker) and its selection lock
 *   (gestures/selectionLock.ts), the coarse-pointer gate
 *   (gestures/coarsePointer.ts), stepperTracking.ts and the UIKit press and
 *   click constants (motion/uikit/gestures.ts)
 * @output The steppers' press layer: useStepperTouch, which tracks a press on
 *   the steppers (a held half repeats on one steady ramp, a slide carries it
 *   to the other half, the pressed half paints at once), shows the stepping
 *   value while the press lasts and commits it once, at the release, and
 *   tells each stepper click what it steps: a tap's click steps the half the
 *   press lifted on
 * @position NumberInput's one touch module, imported only by NumberInput.tsx,
 *   so a desktop build can swap it out whole
 *
 * A finger is tracked through the column's press tracker, which attaches only
 * where the primary pointer is coarse (`spec:AST-094` FR19, FR24); a mouse,
 * and a pen where the primary pointer is fine, through the column's own
 * pointer events. A keyboard or assistive technology activates a stepper
 * through its click. A tap steps on the browser's click after its lift, as a
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
 * `takeClick`, its column forwards its pointer events) and
 * NumberInput.stepperTouch.test.tsx.
 */

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {useMediaQuery} from '../hooks/useMediaQuery';
import {COARSE_POINTER_QUERY} from '../gestures/coarsePointer';
import {
  browserClock,
  paintPress,
  readPressPaint,
  usePressTracker,
  type PressTracker,
  type UsePressTrackerOptions,
} from '../gestures';
import {lockSelection} from '../gestures/selectionLock';
import {UIKIT_CLICK, UIKIT_PRESS} from '../motion/uikit/gestures';
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
  /**
   * The column's pointer events: a mouse, and a pen where the primary
   * pointer is fine, hold a stepper through them.
   */
  pointer: {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
  };
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

  // The one layout read of a press: client y where the decrement half begins.
  const readSplit = (): number | null => {
    const decrementBox = decrementRef.current?.getBoundingClientRect();
    return decrementBox == null || decrementBox.height === 0
      ? null
      : decrementBox.top;
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
        press.split = readSplit();
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
        liftRef.current = isLift ? {at: browserClock.now(), tap: null} : null;
        return;
      }
      const isInside =
        event === 'touchDragInside' ||
        event === 'touchDragEnter' ||
        event === 'touchUpInside';
      const half: StepperHalf | null = isInside ? halfAt(touch.y) : null;
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
      browserClock.now() - lift.at > UIKIT_CLICK.strayClickWindow.value
    ) {
      return 'own';
    }
    return lift.tap ?? 'none';
  };

  // The press tracker is touch-only work: it attaches only where the primary
  // pointer is coarse, following it (`spec:AST-094` FR19, FR24).
  const isCoarse = useMediaQuery(COARSE_POINTER_QUERY);
  const noColumnRef = useRef<HTMLDivElement | null>(null);

  // A mouse, and a pen where the primary pointer is fine, hold a stepper on
  // the column's own pointer events: no touch-only work runs for them
  // (FR24). Where the primary pointer is coarse a pen's touches reach the
  // press tracker instead.
  const pointerIdRef = useRef<number | null>(null);
  const isHeldHere = (event: ReactPointerEvent<HTMLElement>) =>
    event.pointerType === 'mouse' || (event.pointerType === 'pen' && !isCoarse);
  const halfUnder = (
    event: ReactPointerEvent<HTMLElement>,
  ): StepperHalf | null => {
    const box = columnRef.current?.getBoundingClientRect();
    const isInside =
      box != null &&
      event.clientX >= box.left &&
      event.clientX <= box.right &&
      event.clientY >= box.top &&
      event.clientY <= box.bottom;
    return isInside ? halfAt(event.clientY) : null;
  };
  const pointer: StepperTouch['pointer'] = {
    onPointerDown: event => {
      const latest = latestRef.current;
      if (
        !isHeldHere(event) ||
        event.button !== 0 ||
        latest.isDisabled ||
        latest.isReadOnly
      ) {
        return;
      }
      // The press stays the column's when the pointer leaves it.
      const column = event.currentTarget;
      if (typeof column.setPointerCapture === 'function') {
        column.setPointerCapture(event.pointerId);
      }
      pointerIdRef.current = event.pointerId;
      liftRef.current = null;
      pressValueRef.current = null;
      const press = pressRef.current;
      press.isReleased = false;
      press.split = readSplit();
      press.landedOn = halfOf(event.target) ?? halfAt(event.clientY);
      press.half = press.landedOn;
      tracking.begin(press.half);
      tracking.deliver(browserClock.now());
      paint(press.half);
    },
    onPointerMove: event => {
      const press = pressRef.current;
      if (event.pointerId !== pointerIdRef.current || press.isReleased) {
        return;
      }
      press.half = halfUnder(event);
      tracking.move(press.half);
      paint(press.half);
    },
    onPointerUp: event => {
      if (event.pointerId !== pointerIdRef.current) {
        return;
      }
      pointerIdRef.current = null;
      const press = pressRef.current;
      if (press.isReleased) {
        liftRef.current = {at: browserClock.now(), tap: null};
        return;
      }
      press.half = null;
      liftRef.current = {
        at: browserClock.now(),
        tap: tracking.end(halfUnder(event)),
      };
      paint(null);
      commit();
    },
    onPointerCancel: event => {
      if (event.pointerId !== pointerIdRef.current) {
        return;
      }
      pointerIdRef.current = null;
      liftRef.current = null;
      tracking.cancel();
      pressRef.current.half = null;
      paint(null);
      discard();
    },
  };

  // The hook attaches to the column whenever it is mounted (hasNumberSteppers
  // can turn on after the field mounts, or off and on again).
  const tracker = usePressTracker(isCoarse ? columnRef : noColumnRef, options);
  useIsomorphicLayoutEffect(() => {
    trackerRef.current = tracker;
  });

  return {takeClick, pointer};
}
