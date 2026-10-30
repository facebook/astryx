// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useAlertMotion.ts
 * @input Whether the alert is open, whether it runs UIKit's motion, the
 *   motion animator, the alert entries of the UIKit constants table, and the
 *   layer runtime's input hold (Layer/inputHold)
 * @output Exports useAlertMotion and AlertMotion: when the Dialog is
 *   presented (it stays open while the alert leaves), and the callback ref
 *   that puts the animators and the input hold on the dialog; whether a touch
 *   may act is the hold's (isInHeldLayer), which the gesture host reads
 * @position Internal hook of AlertDialog; the touch presentation's motion
 *
 * UIKit's alert motion (measured on iOS 26.2; numbers in
 * motion/uikit/alert.ts, springs in the `springs.alertPresent` and
 * `springs.alertDismiss` roles):
 *
 * - presenting, the alert scales from 1.2 to 1 and fades in, and the dimming
 *   fades in, all on one critically damped spring (0.404 s); nothing moves
 *   from the opener;
 * - dismissing, the alert and the dimming only fade out, on the same spring,
 *   from where they are (closed mid-presentation, or reopened mid-exit, the
 *   fade springs from the presented opacity with its velocity);
 * - input is held during either transition (Layer/inputHold): while
 *   it presents, a touch, a pointer press or a click anywhere reaches nothing
 *   (keys and assistive technology stay live, and nothing is inert) until
 *   the presentation completes (UIKit's touch window, counted from when the
 *   browser started it, `handle.started`); while it leaves, its content is
 *   inert under the same shield until it is hidden;
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
 * touch window and that backstop derive from the lengths of the springs the
 * animator plays, so they follow the springs. The springs are the internal
 * motion roles `springs.alertPresent` and `springs.alertDismiss`
 * (`component:AlertDialog` FR6, `spec:AST-094` FR4), which no per-role theme
 * variable changes (`spec:AST-094` DEC-15); the timings are measured values,
 * not roles.
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
import {
  settlingDuration,
  toSpring,
  type SpringDescription,
} from '../motion/spring';
import {holdInput} from '../Layer/inputHold';
import {alertController} from '../motion/uikit/alert';
import {
  ALERT_DISMISS_SPRING,
  ALERT_PRESENT_SPRING,
  registerAlertSprings,
} from '../motion/uikit/springs';

/**
 * The alert's springs, played through their internal motion roles
 * `springs.alertPresent` and `springs.alertDismiss` (`component:AlertDialog`
 * FR6, `spec:AST-094` FR4). Registering only those two rows keeps every other
 * spring out of AlertDialog's bundle; it is idempotent and happens only when
 * the touch motion first runs.
 */
function alertSprings(): {
  present: SpringDescription;
  dismiss: SpringDescription;
} {
  registerAlertSprings();
  return {present: ALERT_PRESENT_SPRING, dismiss: ALERT_DISMISS_SPRING};
}

/** A dialog that misses its exit's end still closes this long after it. */
const EXIT_BACKSTOP_MS = 100;

/**
 * How long a spring the alert plays runs, in whole ms: its settling duration
 * (0.1 % from rest), the length UIKit gives the Core Animation spring.
 */
function springLengthMs(spring: SpringDescription): number {
  return Math.round(settlingDuration(toSpring(spring)) * 1000);
}

/**
 * How long touches stay out once the presentation has started: the length
 * of the presentation spring the animator plays, plus the frame or two UIKit
 * takes to complete it (435 of 404 ms, measured).
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

function touchWindowMs(): number {
  const {present} = alertController;
  // UIKit's frame or two after the spring, from the measured pair.
  const lag = present.ignoresTouchesForMs - present.durationMs;
  return springLengthMs(alertSprings().present) + lag;
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
  // The exit in flight: only its own end may hide the dialog.
  const exitRef = useRef<MotionHandle | null>(null);
  // The input hold in place (Layer/inputHold): a touch during
  // either transition reaches nothing.
  const releaseHoldRef = useRef<(() => void) | null>(null);
  // The action a dismissal's hold blurred (its content turns inert), given
  // focus back if the alert reopens mid-exit.
  const blurredByDismissalRef = useRef<HTMLElement | null>(null);
  // Unmounting lets the alert go at once, hold included. The alert counts as
  // hidden again, so an effect replay (StrictMode runs every cleanup once,
  // then every effect) presents it again and places its hold
  // (architecture:react-component-runtime INV3).
  useEffect(
    () => () => {
      releaseHoldRef.current?.();
      releaseHoldRef.current = null;
      statusRef.current = 'hidden';
      exitRef.current = null;
      blurredByDismissalRef.current = null;
    },
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
    // One hold at a time on the alert: a new transition replaces the last.
    const hold = (
      until: PromiseLike<unknown>,
      scope: 'viewport' | 'layer',
      cancel?: () => void,
    ) => {
      releaseHoldRef.current?.();
      const element = elementRef.current;
      const release =
        element == null ? null : holdInput(element, {until, scope});
      releaseHoldRef.current = () => {
        cancel?.();
        release?.();
      };
    };
    // A presentation holds every touch until it completes: UIKit's measured
    // touch window after the browser actually started it
    // (`alertController.present.ignoresTouchesForMs`: UIKit lab, iOS 26.2,
    // taps at 400 ms ignored and at 450 ms handled; UIKit completes a frame
    // or two after the 404 ms spring, so the hold outlasts the animation's
    // `finished`), or, under reduced motion, the animator's cross-fade's end
    // (its duration is the animator's).
    const holdWhilePresenting = (handle: MotionHandle) => {
      if (panel.reducedMotion() !== 'off') {
        hold(handle.finished, 'viewport');
        return;
      }
      const window = windowAfterStart(handle.started, touchWindowMs);
      hold(window.end, 'viewport', window.cancel);
    };
    if (now === 'open' && was === 'hidden') {
      // The Dialog opened its modal in this same flush (its effect runs
      // first), and nothing has painted it yet. The alert starts at its
      // starting values and moves from rest with no start time: the browser
      // starts it at the commit that first shows it, as Core Animation starts
      // an animation at its transaction's commit, and the animator promotes
      // it in this task. Chromium runs it on the compositor from that first
      // frame through a busy main thread (the busy-thread browser proof). In
      // iOS Safari an animation created in the task that first displays a
      // dialog can stay on the main thread (motion/animator.ts, known limits);
      // that case is not yet proven here.
      panel.set({opacity: 0, scale: presentScaleFrom(elementRef.current)});
      backdrop.set({opacity: 0});
      holdWhilePresenting(present(panel, backdrop));
      return;
    }
    if (now === 'open' && was === 'leaving') {
      // Reopened mid-exit: fade back from where it is, with its velocity.
      // Touches come back a presentation's time after that fade starts.
      exitRef.current = null;
      holdWhilePresenting(
        fadeFromHere(panel, backdrop, 1, alertSprings().present),
      );
      // The dismissal's hold is released, its content live again: the action
      // it blurred gets focus back, unless focus has gone somewhere since.
      const blurred = blurredByDismissalRef.current;
      blurredByDismissalRef.current = null;
      const doc = elementRef.current?.ownerDocument;
      if (
        blurred?.isConnected === true &&
        doc != null &&
        (doc.activeElement == null || doc.activeElement === doc.body)
      ) {
        blurred.focus({preventScroll: true});
      }
      return;
    }
    if (now === 'leaving') {
      // A dismissal drops every input until it ends: the alert's content is
      // inert (no click, key or assistive-technology activation reaches an
      // action) and the hold's shield catches every touch.
      const handle = fadeFromHere(panel, backdrop, 0, alertSprings().dismiss);
      const element = elementRef.current;
      const focused = element?.ownerDocument.activeElement;
      blurredByDismissalRef.current =
        focused instanceof HTMLElement &&
        focused !== element &&
        element?.contains(focused) === true
          ? focused
          : null;
      hold(handle.finished, 'layer');
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
    blurredByDismissalRef.current = null;
    releaseHoldRef.current?.();
    releaseHoldRef.current = null;
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
      springLengthMs(alertSprings().dismiss) + EXIT_BACKSTOP_MS,
    );
    return () => clearTimeout(backstop);
  }, [isLeaving]);

  return {isPresented, isDriving: isEnabled, ref};
}

/**
 * Settles `windowMs()` after the time `started` reports (performance.now()
 * time), counted when it reports; `cancel` stops the timer.
 */
function windowAfterStart(
  started: Promise<number>,
  windowMs: () => number,
): {end: Promise<void>; cancel: () => void} {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let isCancelled = false;
  const end = new Promise<void>(resolve => {
    void started.then(start => {
      if (!isCancelled) {
        timer = setTimeout(
          resolve,
          Math.max(0, start + windowMs() - performance.now()),
        );
      }
    });
  });
  return {
    end,
    cancel: () => {
      isCancelled = true;
      clearTimeout(timer);
    },
  };
}

function present(panel: Animator, backdrop: Animator): MotionHandle {
  // From rest and with no `at` (a frame's timestamp is stale after a busy
  // main thread): the browser starts both at the frame that commits them, one
  // start for the alert and its dimming, as Core Animation starts an
  // animation at its transaction's commit. Under reduced motion the
  // animator's own policy turns it into an opacity-only cross-fade
  // (design:reduced-motion); the alert passes no curve of its own (DR4).
  const spring = alertSprings().present;
  const handle = panel.animate({opacity: 1, scale: 1}, {spring});
  backdrop.animate({opacity: 1}, {spring});
  return handle;
}
