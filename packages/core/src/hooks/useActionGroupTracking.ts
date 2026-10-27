// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useActionGroupTracking.ts
 * @input A ref to the element whose touches are tracked, the selector of the
 *   actions inside it, and the component's tracking constants
 * @output Exports useActionGroupTracking and ActionGroupTrackingOptions
 * @position Internal hook (not exported from the hooks entry) for the touch
 *   presentations whose actions UIKit tracks as one group, as an alert's
 *   are; consumed by AlertDialog
 *
 * UIKit tracks an alert's actions as one group, not as separate buttons
 * (measured on iOS 26.2; the numbers are in motion/uikit/alert.ts):
 *
 * - the action under the finger highlights in the touch-down frame;
 * - sliding off it cuts its highlight and sliding onto another highlights
 *   that one; between or outside the actions nothing is highlighted;
 * - lifting runs the action under the finger, and nothing when there is
 *   none; the lifted action's highlight fades;
 * - tracking spans the whole element it is attached to, so a touch that
 *   lands on the message highlights nothing until it slides onto an action;
 * - while the owner says presses are inert (`isInert`, read when a press
 *   begins: an alert during its present or dismiss transition), a touch is
 *   still taken, so the browser makes no click of it, but paints and runs
 *   nothing, as UIKit drops touches during a transition.
 *
 * One recognizer does it: a long press with no minimum duration and no
 * movement limit, so it begins on the touch, claims it (nothing under the
 * finger scrolls) and swallows the browser's click for it. Inside a scroller
 * it first waits the scroll view's content-touch delay without travelling
 * past the press slop, so a flick still scrolls. The actions' own press
 * tracking never sees the touch (`delaysTouchesBegan`), and the action runs
 * through its own click, inside the lift, so it keeps the user activation
 * and every click handler. A pen is tracked like a finger, as UIKit tracks
 * Apple Pencil on an alert's actions; a mouse keeps the browser's own click.
 * The recognizer is attached only while tracking is on, so a caller that
 * turns it on under a touch presentation attaches no touch work where the
 * primary pointer is fine (`spec:AST-094` FR19). Turning tracking off, or
 * unmounting, ends any release fade still running.
 *
 * Nothing reads layout after the press begins: the actions' rects are read
 * once when it begins, then hit-tested. A move costs at most two attribute
 * writes and never a render. The tracking itself is actionGroupTracker.ts;
 * this hook binds it to the one recognizer.
 *
 * SYNC: When modified, update useActionGroupTracking.test.tsx
 */

import {useEffect, useRef, type RefObject} from 'react';
import {LongPressGestureRecognizer} from '../gestures/LongPressGestureRecognizer';
import {lockSelection} from '../gestures/selectionLock';
import type {GestureTouch, PointerKind} from '../gestures/types';
import {useGestureRecognizer} from '../gestures/useGestureRecognizer';
import {UIKIT_PRESS} from '../motion/uikit/gestures';
import {
  createActionGroupTracker,
  type ActionGroupTracker,
  type ActionGroupTrackerOptions,
} from './actionGroupTracker';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';

export interface ActionGroupTrackingOptions {
  /** Selects the actions inside the tracked element. */
  itemSelector: string;
  /** How long after touch-down the touched action highlights, ms. */
  highlightOnsetMs: number;
  /** How far outside an action the finger keeps it highlighted, px. */
  highlightExpansion: number;
  /** Contacts that are tracked; others keep the browser's click. @default touch and pen */
  pointerTypes?: ReadonlyArray<PointerKind>;
  /** A touch whose target this rejects is not tracked (a modal's backdrop). */
  shouldTrack?: (target: unknown) => boolean;
  /**
   * Read when a press begins: when true, the press is still taken (the
   * browser makes no click of it) but paints nothing and runs nothing, as
   * UIKit drops touches during a presentation transition.
   */
  isInert?: () => boolean;
  /**
   * Off, nothing is attached and nothing is tracked: pass the touch
   * presentation's state, so no touch work attaches where the primary
   * pointer is fine (`spec:AST-094` FR19). @default true
   */
  isEnabled?: boolean;
  /**
   * Let the gesture host write a long press's permanent styles on the
   * tracked element (`touch-action`, and no callout and no text selection
   * for every pointer). Pass false to keep text selectable with a mouse: a
   * held finger or pen still starts no selection and opens no callout
   * (the recognizer's `selectionLock`, `spec:AST-094` FR41). @default true
   */
  manageStyle?: boolean;
  /** Runs the action under the finger at the lift. @default its own click */
  onActivate?: (item: HTMLElement) => void;
  /**
   * Which action a point is on, from the rects measured at press start
   * (the tracker's `resolveTarget`), read at each press. @default the
   * action whose rect, grown by `highlightExpansion`, holds the point
   */
  resolveTarget?: ActionGroupTrackerOptions['resolveTarget'];
}

const PRESS = UIKIT_PRESS;

/** The ref handed to the recognizer while tracking is off: no element. */
const DETACHED: RefObject<Element | null> = {current: null};

/**
 * Track touches on the element behind `ref` across the actions inside it,
 * the way UIKit tracks an alert's actions.
 */
export function useActionGroupTracking(
  ref: RefObject<HTMLElement | null>,
  options: ActionGroupTrackingOptions,
): LongPressGestureRecognizer {
  const optionsRef = useRef(options);
  // Keeps the recognizer's delegate and listener, which run outside render,
  // reading the latest options.
  useIsomorphicLayoutEffect(() => {
    optionsRef.current = options;
  });
  const trackerRef = useRef<ActionGroupTracker | null>(null);
  trackerRef.current ??= createActionGroupTracker(() => ({
    roots: () => [ref.current],
    itemSelector: optionsRef.current.itemSelector,
    highlightExpansion: optionsRef.current.highlightExpansion,
    onActivate: optionsRef.current.onActivate,
    resolveTarget: optionsRef.current.resolveTarget,
  }));
  const tracker = trackerRef.current;
  const isEnabled = options.isEnabled ?? true;
  // When tracking turns off and when the group unmounts: drops a touch it is
  // tracking (its highlight is cut, and its lift runs nothing, as the
  // recognizer is disabled; the gesture host does not report a cancellation
  // to a disabled recognizer's listener), and ends the release fades it
  // started (their timers, and the paint each would remove): the lift that
  // runs an action usually closes the alert before its fade ends.
  useEffect(
    () => () => {
      trackerRef.current?.cancel();
      trackerRef.current?.dispose();
    },
    [isEnabled],
  );

  return useGestureRecognizer(
    isEnabled ? ref : DETACHED,
    () =>
      new LongPressGestureRecognizer({
        name: 'ActionGroupTracking',
        minimumPressDuration: options.highlightOnsetMs,
        allowableMovement: Number.POSITIVE_INFINITY,
        allowedPointerTypes: options.pointerTypes ?? ['touch', 'pen'],
        delaysTouchesBegan: true,
        // The group's hold does something (it tracks the finger across the
        // actions, and the lift picks one), so a held finger or pen starts
        // no text selection and opens no callout on it while down, as on
        // UIKit's action rows (`spec:AST-094` FR41). A long press brings
        // this lock by default; the group names it, since its hold has no
        // minimum duration. A mouse keeps selecting text.
        selectionLock: lockSelection,
        shouldReceiveTouch: (recognizer, touch) =>
          receiveTouch(recognizer, touch, optionsRef.current),
      }),
    recognizer => {
      switch (recognizer.state) {
        case 'began': {
          const {x, y} = recognizer.location();
          // An inert press is taken and tracks nothing.
          tracker.begin(x, y, {inert: optionsRef.current.isInert?.() === true});
          break;
        }
        case 'changed': {
          const {x, y} = recognizer.location();
          tracker.move(x, y);
          break;
        }
        case 'ended':
          tracker.end();
          break;
        case 'cancelled':
          tracker.cancel();
          break;
        case 'possible':
        case 'failed':
          // Listeners are not called for these.
          break;
      }
    },
    {
      isEnabled,
      manageStyle: options.manageStyle ?? true,
    },
  );
}

/**
 * The recognizer's should-receive delegate. It also picks the clock for the
 * finger that starts a press: inside a scroller the press waits the scroll
 * view's content-touch delay and fails past the press slop, so the scroller
 * takes a flick; anywhere else it begins on the touch with no movement limit.
 */
function receiveTouch(
  recognizer: LongPressGestureRecognizer,
  touch: GestureTouch,
  options: ActionGroupTrackingOptions,
): boolean {
  if (options.shouldTrack?.(touch.target) === false) {
    return false;
  }
  if (recognizer.numberOfTouches === 0) {
    const isInsideScroller = touch.scroll?.isInsideScroller === true;
    recognizer.minimumPressDuration = isInsideScroller
      ? PRESS.contentTouchDelay.value
      : options.highlightOnsetMs;
    recognizer.allowableMovement = isInsideScroller
      ? PRESS.slop.value
      : Number.POSITIVE_INFINITY;
  }
  return true;
}
