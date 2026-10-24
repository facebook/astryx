// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useToastGesture.ts
 * @input Uses a resolved Toast edge direction, timer pause/resume hooks,
 *   dismissal callback, enabled state, interactive-descendant policy, the
 *   UIKit constants table (motion/uikit/toast), the shared gesture system
 *   and the compositor animator
 * @output Returns the Toast card root ref; a PanGestureRecognizer attached to
 *   it drives swipe-to-dismiss and an animator moves the card
 * @position Internal Toast gesture unit; attached to the Toast card root
 *
 * The swipe follows iOS's notification banner (values and sources in
 * motion/uikit/toast.ts):
 *
 * - it is a one-way pan toward the Toast's edge, for touch and pen (a mouse
 *   keeps text selection), on the shared gesture system (../gestures). It
 *   begins at UIKit's pan hysteresis when the drag is `toast.axisRatio`
 *   times more vertical than horizontal. A drag that starts sideways or away
 *   from the edge fails it and leaves the browser the touch; once the finger
 *   has gone a few px toward the edge, the gesture system claims the touch
 *   (before Safari would scroll the page) and it stays the toast's. Once it
 *   began, a second finger is ignored;
 * - the card stays still for the first `toast.followFrom` px of finger
 *   travel, then follows at `toast.followRatio` of the finger, writing only
 *   its translation (no render, no layout read);
 * - on release, the card dismisses if it is `toast.dismissOffset` out or
 *   the finger was moving toward the edge at `toast.flickVelocity`
 *   (`isDismissRelease`). A dismissal calls `onSwipeExit`, then `dismiss`:
 *   the card plays the Toast's ordinary exit from where the finger left it,
 *   as the banner plays its ordinary exit whatever the release speed.
 *   Otherwise the card springs back to rest on the compositor, handed its
 *   release velocity, on `toast.settle` as the element's theme sets it (a
 *   motion role); Reduce Motion keeps that, as the banner does;
 * - while the card springs back, touches pass through to the page: the
 *   banner never catches a settling card;
 * - touching down pauses the auto-hide timer; anything but a dismissal
 *   resumes it.
 *
 * SYNC: When modified, update toastSwipe.ts, Toast.doc.mjs and the swipe
 *   tests in ToastViewport.test.tsx and
 *   __tests__/ToastSwipe.interaction.browser.spec.ts.
 */

import {useEffect, useRef, useState} from 'react';
import type {RefObject} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {PanGestureRecognizer} from '../gestures/PanGestureRecognizer';
import {useGestureRecognizer} from '../gestures/useGestureRecognizer';
import {createAnimator, type MotionHandle} from '../motion/animator';
import {toast} from '../motion/uikit/toast';
import {followOffset, isDismissRelease} from './toastSwipe';

export type ToastGestureDirection = 1 | -1;

interface SwipeSession {
  pausedTimer: boolean;
  /** Where the card is now, px from rest toward the edge. */
  offset: number;
}

interface UseToastGestureOptions {
  direction: ToastGestureDirection;
  enabled: boolean;
  canPauseTimer: boolean;
  isTimerPaused: () => boolean;
  pauseTimer: () => void;
  resumeTimer: () => void;
  dismiss: () => void;
  /** Called just before `dismiss` when a swipe dismisses the toast. */
  onSwipeExit?: () => void;
  shouldIgnoreTarget: (
    target: EventTarget | null,
    root: HTMLElement,
  ) => boolean;
}

interface UseToastGestureResult {
  rootRef: RefObject<HTMLDivElement | null>;
}

const RELEASE_OPTIONS = {reducedMotion: 'keep'} as const;

function panDirection(direction: ToastGestureDirection): 'down' | 'up' {
  return direction === 1 ? 'down' : 'up';
}

export function useToastGesture(
  options: UseToastGestureOptions,
): UseToastGestureResult {
  const rootRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<SwipeSession | null>(null);
  const settlingRef = useRef<MotionHandle | null>(null);
  const optionsRef = useRef(options);
  useIsomorphicLayoutEffect(() => {
    optionsRef.current = options;
  });
  const [animator] = useState(() => createAnimator(null));
  useIsomorphicLayoutEffect(() => {
    animator.attach(rootRef.current);
    return () => animator.attach(null);
  }, [animator]);

  const pan = useGestureRecognizer(
    rootRef,
    () =>
      new PanGestureRecognizer({
        // The published name app code relates to (gesture delegates).
        name: 'Toast.swipe',
        direction: panDirection(options.direction),
        allowedPointerTypes: ['touch', 'pen'],
        axisRatio: toast.axisRatio,
        maximumNumberOfTouches: 1,
        shouldReceiveTouch: (_recognizer, touch) => {
          const root = rootRef.current;
          const current = optionsRef.current;
          if (
            root == null ||
            settlingRef.current != null ||
            current.shouldIgnoreTarget(touch.target as EventTarget, root)
          ) {
            return false;
          }
          if (sessionRef.current == null) {
            // Touch-down: hold the auto-hide timer while the finger is on
            // the card.
            const pausedTimer =
              current.canPauseTimer && !current.isTimerPaused();
            if (pausedTimer) {
              current.pauseTimer();
            }
            sessionRef.current = {pausedTimer, offset: 0};
          }
          return true;
        },
      }),
    undefined,
    {isEnabled: options.enabled},
  );

  useIsomorphicLayoutEffect(() => {
    pan.setDirection(panDirection(options.direction));
  }, [pan, options.direction]);

  useEffect(
    () =>
      pan.addTransitionListener((recognizer, _from, to) => {
        const session = sessionRef.current;
        if (session == null) {
          return;
        }
        const {direction, dismiss, resumeTimer, onSwipeExit} =
          optionsRef.current;
        // Finger travel toward the edge since touch-down, hysteresis
        // included: the card's dead zone is measured from where it landed.
        const fingerTravel = recognizer.totalTranslation().y * direction;
        if (to === 'began' || to === 'changed') {
          session.offset = followOffset(fingerTravel);
          animator.set({y: session.offset * direction});
          return;
        }
        if (to !== 'ended' && to !== 'cancelled' && to !== 'failed') {
          return;
        }
        sessionRef.current = null;
        const fingerVelocity = recognizer.velocity().y * direction;
        if (
          to === 'ended' &&
          isDismissRelease(session.offset, fingerVelocity)
        ) {
          onSwipeExit?.();
          dismiss();
          return;
        }
        if (session.offset !== 0) {
          // The card moves at the follow ratio of the finger, so it hands on
          // that share of the finger's speed (none if the touch was taken
          // away).
          const velocity =
            to === 'ended' ? fingerVelocity * toast.followRatio : 0;
          const handle = animator.animate(
            {y: 0},
            {spring: toast.settle, velocity: {y: velocity * direction}},
            RELEASE_OPTIONS,
          );
          settlingRef.current = handle;
          void handle.finished.then(() => {
            if (settlingRef.current === handle) {
              settlingRef.current = null;
            }
          });
        }
        if (session.pausedTimer) {
          resumeTimer();
        }
      }),
    [animator, pan],
  );

  return {rootRef};
}
