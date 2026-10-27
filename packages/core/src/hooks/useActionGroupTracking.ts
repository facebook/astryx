// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useActionGroupTracking.ts
 * @input A ref to a group of sibling actions, the actions' selector, and the
 *   component's tracking constants
 * @output Exports useActionGroupTracking and ActionGroupTrackingOptions
 * @position Internal hook (not exported from the hooks entry): the long
 *   press that drives the shared action-group tracker
 *   (`hooks/actionGroupTracker.ts`) for a group a held pointer slides
 *   across (`family:action-groups`); consumed by AlertDialog
 *
 * A group of sibling actions behaves like a menu under a press
 * (`family:action-groups` FR1–FR5, `spec:AST-094` FR26–FR28): the action
 * under the pointer highlights, the highlight follows the pointer from
 * action to action (nothing over a gap, a disabled action, or outside the
 * group), and the lift runs the action under the pointer, once, through its
 * own click; a lift outside the group, a cancelled pointer, a second finger
 * or the window losing focus runs nothing. While the owner says presses are
 * inert (`isInert`, read when a press begins: an alert during its present or
 * dismiss transition), a press is still taken, so the browser makes no click
 * of it, but paints and runs nothing. The tracking itself, the rects
 * read once when the press begins, the highlight and its release fade, and
 * the lift's click, is the shared tracker's; this hook only drives it.
 *
 * One recognizer drives it: a long press with no minimum duration and no
 * movement limit, so it begins on the press, claims it (nothing under the
 * finger scrolls) and swallows the browser's click for it. Inside a scroller
 * it first waits the scroll view's content-touch delay without travelling
 * past the press slop, so a flick still scrolls. The actions' own press
 * tracking never sees the press (`delaysTouchesBegan`). Every pointer is
 * tracked, a mouse and a pen as well as a finger (FR5): where the primary
 * pointer is fine the gesture host serves the group with one passive
 * `pointerdown` listener and document listeners only during a press
 * (`spec:AST-094` FR19, its action-group exception). The recognizer is
 * attached only while tracking is on. Turning tracking off, or unmounting,
 * ends any press and any release fade still running.
 *
 * SYNC: When modified, update useActionGroupTracking.test.tsx
 */

import {useEffect, useRef, useState, type RefObject} from 'react';
import {isActive} from '../gestures/GestureRecognizer';
import {LongPressGestureRecognizer} from '../gestures/LongPressGestureRecognizer';
import {lockSelection} from '../gestures/selectionLock';
import type {GestureTouch, PointerKind} from '../gestures/types';
import {useGestureRecognizer} from '../gestures/useGestureRecognizer';
import {UIKIT_PRESS} from '../motion/uikit/gestures';
import {createActionGroupTracker} from './actionGroupTracker';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';

export interface ActionGroupTrackingOptions {
  /** Selects the actions inside the tracked element. */
  itemSelector: string;
  /** How long after touch-down the touched action highlights, ms. */
  highlightOnsetMs: number;
  /** How far outside an action the finger keeps it highlighted, px. */
  highlightExpansion: number;
  /** Pointers that are tracked; others keep the browser's click. @default every pointer */
  pointerTypes?: ReadonlyArray<PointerKind>;
  /** A press whose target this rejects is not tracked. */
  shouldTrack?: (target: unknown) => boolean;
  /**
   * Read when a press begins: when true, the press is still taken (the
   * browser makes no click of it) but paints nothing and runs nothing, as
   * UIKit drops touches during a presentation transition.
   */
  isInert?: () => boolean;
  /** Off, nothing is attached and nothing is tracked. @default true */
  isEnabled?: boolean;
  /**
   * Let the gesture host write a long press's permanent styles on the
   * group (`touch-action`, and no callout and no text selection for every
   * pointer). A held finger or pen starts no selection and opens no callout
   * either way (the recognizer's `selectionLock`, `spec:AST-094` FR41).
   * @default true
   */
  manageStyle?: boolean;
  /** Runs the action under the finger at the lift. @default its own click */
  onActivate?: (item: HTMLElement) => void;
}

const PRESS = UIKIT_PRESS;

/** The ref handed to the recognizer while tracking is off: no element. */
const DETACHED: RefObject<Element | null> = {current: null};

/** Every pointer a group tracks (`family:action-groups` FR5). */
const EVERY_POINTER: ReadonlyArray<PointerKind> = ['touch', 'pen', 'mouse'];

/**
 * The group's press: a long press that a second finger on the group ends
 * with nothing acting (`family:action-groups` FR3), where a plain long press
 * ignores it.
 */
class ActionGroupPress extends LongPressGestureRecognizer {
  protected override acceptsTouch(touch: GestureTouch): boolean {
    if (isActive(this.state)) {
      this.setState('cancelled');
      return false;
    }
    return super.acceptsTouch(touch);
  }
}

/**
 * Track a held pointer on the group behind `ref` across the actions inside
 * it, through the shared action-group tracker.
 */
export function useActionGroupTracking(
  ref: RefObject<HTMLElement | null>,
  options: ActionGroupTrackingOptions,
): ActionGroupPress {
  const optionsRef = useRef(options);
  // Keeps the recognizer's delegate and the tracker, which run outside
  // render, reading the latest options.
  useIsomorphicLayoutEffect(() => {
    optionsRef.current = options;
  });
  const [tracker] = useState(() =>
    createActionGroupTracker(() => ({
      roots: () => [ref.current],
      itemSelector: optionsRef.current.itemSelector,
      highlightExpansion: optionsRef.current.highlightExpansion,
      onActivate: optionsRef.current.onActivate,
      // The browser's own click for a press the group ran is taken, so the
      // action runs once: the gesture host swallows it for a press it claims,
      // and this covers one it does not (a mouse where the primary pointer is
      // coarse). An activation with no click count always passes.
      swallowsNativeClick: true,
    })),
  );
  const isEnabled = options.isEnabled ?? true;
  // When tracking turns off and when the group unmounts: drops a press it
  // is tracking (its highlight is cut, and its lift runs nothing, as the
  // recognizer is disabled; the gesture host does not report a cancellation
  // to a disabled recognizer's listener), and ends the release fades it
  // started: the lift that runs an action usually closes the group's owner
  // before its fade ends.
  useEffect(
    () => () => {
      tracker.cancel();
      tracker.dispose();
    },
    [tracker, isEnabled],
  );

  return useGestureRecognizer(
    isEnabled ? ref : DETACHED,
    () =>
      new ActionGroupPress({
        name: 'ActionGroupTracking',
        minimumPressDuration: options.highlightOnsetMs,
        allowableMovement: Number.POSITIVE_INFINITY,
        allowedPointerTypes: options.pointerTypes ?? EVERY_POINTER,
        delaysTouchesBegan: true,
        // The group's hold does something (it tracks the pointer across the
        // actions, and the lift picks one), so a held finger or pen starts
        // no text selection and opens no callout on it while down, as on
        // UIKit's action rows (`spec:AST-094` FR41). A long press brings
        // this lock by default; the group names it, since its hold has no
        // minimum duration.
        selectionLock: lockSelection,
        shouldReceiveTouch: (recognizer, touch) =>
          receiveTouch(recognizer, touch, optionsRef.current),
      }),
    recognizer => {
      switch (recognizer.state) {
        case 'began': {
          const {x, y} = recognizer.location();
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
      actionGroup: true,
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
