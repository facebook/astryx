// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ListReorderTouch.ts
 * @input The gesture system's long press and host, the reorder claim values
 *   (motion/uikit/reorder.ts) and the row motion (utils/rowMotion.ts)
 * @output The List reorder's touch layer: `attachTouchHold`, the hold that
 *   picks up a row from its handle under a finger, and `touchMotion`, UIKit's
 *   motion for the rows a reorder moves under a finger (the slides' spring
 *   under the list's theme, the slides, the drop's settle, the way home, and
 *   the continuation across the commit). It registers the reorder table's
 *   motion role before its first motion (`registerReorderTable`)
 * @position Imported by List/useListReorder.ts alone: what the reorder runs
 *   only under a finger sits behind this one import
 *
 * UIKit's reorder control (iOS 26.2, measured): a finger held still on it
 * for the scroll view's content-touch delay (150 ms) claims the drag, and a
 * flick that starts on it scrolls the table instead. So the handle lets the
 * browser pan vertically and pinch-zoom until the claim (its own
 * `touch-action`), and the long press then holds the touch (the gesture
 * system's blocking listener for a mid-gesture claim). A second finger on
 * the screen before the claim makes it a pinch, the browser's (WCAG 1.4.4);
 * after the claim extra fingers change nothing. The gesture host owns the
 * document's touch listeners: it counts the fingers on the screen and locks
 * text selection under the held finger.
 *
 * SYNC: When modified, update List/useListReorder.ts.
 */

import {getGestureHost} from '../gestures/GestureHost';
import {LongPressGestureRecognizer} from '../gestures/LongPressGestureRecognizer';
import {resolveMotion} from '../motion/resolveMotion';
import {
  durationBounceOf,
  toSpring,
  type DurationBounce,
  type SpringDescription,
} from '../motion/spring';
import {registerReorderTable, reorder} from '../motion/uikit/reorder';
import {
  animateRow,
  animatorFor,
  motionOf,
  releaseMotion,
} from '../utils/rowMotion';

/**
 * Lets a finger pick up the row of `handle`: held still for the
 * content-touch delay, and the only finger on the screen. Returns the
 * detach.
 */
export function attachTouchHold(
  handle: HTMLElement,
  onGesture: (recognizer: LongPressGestureRecognizer) => void,
): () => void {
  const host = getGestureHost(handle.ownerDocument);
  const recognizer = new LongPressGestureRecognizer({
    name: 'ListReorderHandle.touch',
    minimumPressDuration: reorder.claim.delayMs,
    allowableMovement: reorder.claim.allowableMovement,
    allowedPointerTypes: ['touch', 'pen'],
    // Only a lone finger: two are the browser's pinch, wherever the second
    // one landed (the gesture host counts every finger on the screen).
    shouldBegin: () => host.fingersDown() <= 1,
    // No text selection or callout under the held finger (the host locks
    // them while it is down, and only then).
    preventsTextSelection: true,
  });
  const unlisten = recognizer.addListener(onGesture);
  // The handle sets its own `touch-action`.
  const detach = host.attach(handle, recognizer, {manageStyle: false});
  return () => {
    detach();
    unlisten();
  };
}

/** Releases a row's offset once its motion arrives. */
function releaseOnArrival(element: HTMLElement, arrived: Promise<boolean>) {
  void arrived.then(done => {
    if (done) {
      releaseMotion(element, 'translate');
    }
  });
}

/** UIKit's motion for the rows of a reorder under a finger. */
export const touchMotion = {
  /**
   * The slides' spring under the list's theme: a motion role
   * (`reorder.slide.spring`) a theme may retune, read once when a motion
   * starts. Registers the reorder table first (once).
   */
  slideBase(list: HTMLElement): DurationBounce {
    registerReorderTable();
    return durationBounceOf(
      toSpring(resolveMotion(list, reorder.slide.spring)),
    );
  },
  /** A row the dragged row passes slides to `y` on `spring`. */
  slide(
    element: HTMLElement,
    y: number,
    spring: SpringDescription,
    at: number,
  ): void {
    void animateRow(element, {y}, spring, {at});
  },
  /** The dropped row springs from rest to `y`, whatever the release velocity. */
  settle(
    element: HTMLElement,
    y: number,
    spring: SpringDescription,
    at: number,
  ): void {
    void animateRow(element, {y}, spring, {at, velocity: {y: 0}});
  },
  /**
   * A row goes back to its place on `spring` (the dragged row from rest),
   * and its offset goes once it arrives.
   */
  home(
    element: HTMLElement,
    spring: SpringDescription,
    at: number,
    fromRest: boolean,
  ): void {
    releaseOnArrival(
      element,
      animateRow(element, {y: 0}, spring, {
        at,
        velocity: fromRest ? {y: 0} : undefined,
      }).finished,
    );
  },
  /**
   * The layout moved a row by `shift` (a commit put it in its new place): its
   * running spring, or `spring` from rest, goes on to its new place from
   * where it is shown. Same spring, same velocity, its target moved with the
   * layout: the curve on screen continues (springs are memoryless).
   */
  follow(
    element: HTMLElement,
    shift: number,
    spring: SpringDescription,
    at: number,
  ): void {
    const running = motionOf(element, 'y')?.spring ?? spring;
    animatorFor(element).rebase({y: shift}, {at});
    releaseOnArrival(
      element,
      animateRow(element, {y: 0}, running, {at}).finished,
    );
  },
};
