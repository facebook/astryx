// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useAlertMotion.ts
 * @input Whether the alert is open, whether it runs UIKit's motion, the
 *   motion animator and the alert entries of the UIKit constants table
 * @output Exports useAlertMotion and AlertMotion: when the Dialog is
 *   presented (it stays open while the alert leaves), the callback ref that
 *   puts the animators on the dialog, and whether a touch may act right now
 * @position Internal hook of AlertDialog; the touch presentation's motion
 *
 * UIKit's alert motion (measured on iOS 26.2; numbers in
 * motion/uikit/alert.ts and springs.alertPresent / alertDismiss):
 *
 * - presenting, the alert scales from 1.2 to 1 and fades in, and the dimming
 *   fades in, all on one critically damped spring (0.404 s); nothing moves
 *   from the opener;
 * - dismissing, the alert and the dimming only fade out, on the same spring,
 *   from where they are (closed mid-presentation, or reopened mid-exit, the
 *   fade springs from the presented opacity with its velocity);
 * - touches during either transition are ignored: input comes back when the
 *   presentation completes (counted from when the browser started it,
 *   `handle.started`), and none is delivered while the alert leaves;
 * - under reduced motion the animator's own policy applies
 *   (docs/design/reduced-motion.md): the alert and the dimming only
 *   cross-fade, and touches come back when that cross-fade ends. The alert
 *   sets no curve of its own there (DR4).
 *
 * Both run on the compositor through the motion animator: the alert is the
 * dialog element itself (`scale`, `opacity`), the dimming is its `::backdrop`
 * (`opacity`), one start time for both: the browser's, at the commit that
 * first shows the dialog. The dialog stays open while it
 * leaves, so focus returns to the opener, the page scroll unlocks and the
 * close event fires when it is hidden; Escape keeps reaching it until then.
 * Reopening it mid-exit fades it back from where it is; unmounting removes it
 * at once; if the exit never reports its end (animations disabled) the
 * dialog closes anyway once its duration and a frame budget have passed. The
 * springs and both durations are motion roles: the animator resolves the
 * springs under the dialog's theme, and the touch window and that backstop
 * resolve the durations (resolveMotion).
 *
 * When `isEnabled` is false (a mouse, the inline preview) nothing here
 * acts: the Dialog opens and closes with the theme's motion.
 *
 * SYNC: When modified, update useAlertMotion.test.tsx and
 * __tests__/AlertDialog.motion.interaction.browser.spec.ts
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {
  createAnimator,
  type Animator,
  type MotionHandle,
} from '../motion/animator';
import type {SpringDescription} from '../motion/spring';
import {resolveMotion} from '../motion/resolveMotion';
import {alertController} from '../motion/uikit/alert';
import {springs} from '../motion/uikit/springs';

/** A dialog that misses its exit's end still closes this long after it. */
const EXIT_BACKSTOP_MS = 100;

/**
 * How long touches stay out once the presentation has started: its duration
 * under the dialog's theme (`alertController.present.durationMs`), plus the
 * frame or two UIKit takes to complete it (435 of 404 ms, measured).
 */
/**
 * UIKit's 1.2 start, never wider than the viewport: an alert wider than
 * UIKit's 320 pt would otherwise start past the screen's edges. One layout
 * read, as the alert opens.
 */
function presentScaleFrom(element: HTMLElement | null): number {
  const {scaleFrom} = alertController.present;
  const width = element?.offsetWidth ?? 0;
  const viewport = element?.ownerDocument.documentElement.clientWidth ?? 0;
  return width > 0 && viewport > 0
    ? Math.max(1, Math.min(scaleFrom, viewport / width))
    : scaleFrom;
}

/**
 * Fades the alert and its dimming to `opacity` from where they are: the
 * animator springs from the presented values, with the velocity on screen. A
 * fade that interrupts motion continues from the frame on screen (the animator
 * starts it at the call); one from rest starts at the commit that shows it, as
 * the presentation does. The scale, if still settling, keeps its own curve.
 */
function fadeFromHere(
  panel: Animator,
  backdrop: Animator,
  opacity: number,
  spring: SpringDescription,
): MotionHandle {
  backdrop.animate(
    {opacity},
    {spring, velocity: {opacity: backdrop.getVelocity('opacity')}},
  );
  return panel.animate(
    {opacity},
    {spring, velocity: {opacity: panel.getVelocity('opacity')}},
  );
}

function touchWindowMs(element: Element | null): number {
  const {present} = alertController;
  return (
    resolveMotion(element, present, 'durationMs') +
    present.ignoresTouchesForMs -
    present.durationMs
  );
}

type Status = 'hidden' | 'open' | 'leaving';

export interface AlertMotionOptions {
  /** The caller's open state. */
  isOpen: boolean;
  /** Run UIKit's alert motion (under a finger: a coarse primary pointer). */
  isEnabled: boolean;
}

export interface AlertMotion {
  /** Whether the Dialog is open: true while the alert is shown or leaving. */
  readonly isPresented: boolean;
  /** True while the motion drives the dialog (its theme entrance is off). */
  readonly isDriving: boolean;
  /** Callback ref for the dialog element. */
  readonly ref: (element: HTMLElement | null) => void;
  /** Whether a touch landing now may act (false during the transitions). */
  readonly acceptsTouches: () => boolean;
}

export function useAlertMotion({
  isOpen,
  isEnabled,
}: AlertMotionOptions): AlertMotion {
  // The open state the Dialog sees: the alert stays presented while it
  // leaves. Adjusted while rendering, so the Dialog never commits a close
  // the exit has not finished.
  const [isLeaving, setIsLeaving] = useState(false);
  const [lastIsOpen, setLastIsOpen] = useState(isOpen);
  if (lastIsOpen !== isOpen) {
    setLastIsOpen(isOpen);
    setIsLeaving(!isOpen && isEnabled);
  }
  const isPresented = isOpen || isLeaving;

  const [animators] = useState(() => ({
    panel: createAnimator(null),
    backdrop: createAnimator(null, {pseudoElement: '::backdrop'}),
  }));
  const isEnabledRef = useRef(isEnabled);
  isEnabledRef.current = isEnabled;

  // The animators hold the dialog only while the motion drives it, so a mouse
  // presentation keeps its own styles untouched. The callback is stable: a
  // caller's changing ref must not re-attach them on every render.
  const elementRef = useRef<HTMLElement | null>(null);
  const ref = useCallback(
    (node: HTMLElement | null) => {
      elementRef.current = node;
      const target = isEnabledRef.current ? node : null;
      animators.panel.attach(target);
      animators.backdrop.attach(target);
    },
    [animators],
  );
  useIsomorphicLayoutEffect(() => {
    const {panel, backdrop} = animators;
    if (isEnabled) {
      panel.attach(elementRef.current);
      backdrop.attach(elementRef.current);
      return;
    }
    // A finger gave way to a mouse: the theme's styles show again.
    if (panel.element != null) {
      panel.set({opacity: 1, scale: 1});
      backdrop.set({opacity: 1});
    }
    panel.attach(null);
    backdrop.attach(null);
  }, [animators, isEnabled]);

  // Starts hidden even when mounted open, so a first render that is already
  // open presents like any other opening.
  const statusRef = useRef<Status>('hidden');
  const transitionEndsAtRef = useRef(0);
  // The exit in flight: only its own end may hide the dialog.
  const exitRef = useRef<MotionHandle | null>(null);
  // The presentation in flight: only its own start times the touch window.
  const presentRef = useRef<MotionHandle | null>(null);
  const acceptsTouches = useCallback(
    () =>
      !isEnabledRef.current ||
      (statusRef.current === 'open' &&
        performance.now() >= transitionEndsAtRef.current),
    [],
  );

  useEffect(() => {
    const was = statusRef.current;
    const now: Status = !isPresented ? 'hidden' : isOpen ? 'open' : 'leaving';
    statusRef.current = now;
    if (!isEnabled || was === now) {
      return;
    }
    const {panel, backdrop} = animators;
    // Touches come back when the presentation completes: counted from when
    // the browser actually started it, or, under reduced motion, when the
    // animator's cross-fade ends (its duration is the animator's).
    const armTouchWindow = (handle: MotionHandle) => {
      const isCurrent = () =>
        presentRef.current === handle && statusRef.current === 'open';
      if (panel.reducedMotion() !== 'off') {
        void handle.finished.then(() => {
          if (isCurrent()) {
            transitionEndsAtRef.current = performance.now();
          }
        });
        return;
      }
      void handle.started.then(start => {
        if (isCurrent()) {
          transitionEndsAtRef.current =
            start + touchWindowMs(elementRef.current);
        }
      });
    };
    if (now === 'open' && was === 'hidden') {
      // The Dialog opened its modal in this same flush (its effect runs
      // first), and nothing has painted it yet. The alert starts at its
      // starting values and moves from rest with no start time: the browser
      // starts it at the commit that first shows it, as Core Animation starts
      // an animation at its transaction's commit, and the animator promotes
      // it in this task, so Mobile Safari runs it on the compositor from that
      // first frame through a busy main thread (measured on iOS 26.2).
      transitionEndsAtRef.current = Number.POSITIVE_INFINITY;
      panel.set({opacity: 0, scale: presentScaleFrom(elementRef.current)});
      backdrop.set({opacity: 0});
      const handle = present(panel, backdrop);
      presentRef.current = handle;
      armTouchWindow(handle);
      return;
    }
    presentRef.current = null;
    if (now === 'open' && was === 'leaving') {
      // Reopened mid-exit: fade back from where it is, with its velocity.
      // Touches come back a presentation's time after that fade starts.
      exitRef.current = null;
      transitionEndsAtRef.current = Number.POSITIVE_INFINITY;
      const handle = fadeFromHere(panel, backdrop, 1, springs.alertPresent);
      presentRef.current = handle;
      armTouchWindow(handle);
      return;
    }
    if (now === 'leaving') {
      transitionEndsAtRef.current = Number.POSITIVE_INFINITY;
      const handle = fadeFromHere(panel, backdrop, 0, springs.alertDismiss);
      exitRef.current = handle;
      void handle.finished.then(isDone => {
        if (isDone && exitRef.current === handle) {
          exitRef.current = null;
          setIsLeaving(false);
        }
      });
      return;
    }
    // Hidden: the exit ended and the Dialog closed its modal.
    exitRef.current = null;
  }, [animators, isEnabled, isOpen, isPresented]);

  // An exit whose end is never reported (animations disabled, a detached
  // element) still hides the dialog once its duration has passed. Unmounting
  // mid-exit removes the dialog at once; React detaches the animators
  // through the ref.
  useEffect(() => {
    if (!isLeaving) {
      return;
    }
    const backstop = setTimeout(
      () => {
        exitRef.current = null;
        setIsLeaving(false);
      },
      resolveMotion(elementRef.current, alertController.dismiss, 'durationMs') +
        EXIT_BACKSTOP_MS,
    );
    return () => clearTimeout(backstop);
  }, [isLeaving]);

  return {isPresented, isDriving: isEnabled, ref, acceptsTouches};
}

function present(panel: Animator, backdrop: Animator): MotionHandle {
  // From rest and with no `at` (a frame's timestamp is stale after a busy
  // main thread): the browser starts both at the frame that commits them, one
  // start for the alert and its dimming, as Core Animation starts an
  // animation at its transaction's commit. Under reduced motion the
  // animator's own policy turns it into an opacity-only cross-fade
  // (design:reduced-motion); the alert passes no curve of its own (DR4).
  const handle = panel.animate(
    {opacity: 1, scale: 1},
    {spring: springs.alertPresent},
  );
  backdrop.animate({opacity: 1}, {spring: springs.alertPresent});
  return handle;
}
