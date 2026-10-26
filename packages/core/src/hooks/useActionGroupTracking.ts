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
 *   lands on the message highlights nothing until it slides onto an action.
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
 * writes and never a render.
 *
 * SYNC: When modified, update useActionGroupTracking.test.tsx
 */

import {useEffect, useRef, type RefObject} from 'react';
import {LongPressGestureRecognizer} from '../gestures/LongPressGestureRecognizer';
import {lockSelection} from '../gestures/selectionLock';
import type {GestureTouch, PointerKind} from '../gestures/types';
import {useGestureRecognizer} from '../gestures/useGestureRecognizer';
import {UIKIT_GESTURES} from '../motion/uikit/gestures';
import {PRESSED_ATTRIBUTE} from '../utils/pressFeedback';
import {PRESS_FADE_MS} from '../utils/pressGesture';
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
   * Off, nothing is attached and nothing is tracked: pass the touch
   * presentation's state, so no touch work attaches where the primary
   * pointer is fine (`spec:AST-094` FR19). @default true
   */
  isEnabled?: boolean;
  /**
   * Let the gesture host write a long press's permanent styles on the
   * tracked element (`touch-action`, and no callout and no text selection
   * for every pointer). Pass false to keep text selectable with a mouse: the
   * host's selection lock still turns selection and the callout off while a
   * finger or a pen is down. @default true
   */
  manageStyle?: boolean;
  /** Runs the action under the finger at the lift. @default its own click */
  onActivate?: (item: HTMLElement) => void;
}

/** An action that is not enabled takes no highlight and does not run. */
const DISABLED = ':disabled, [aria-disabled="true"]';

interface TrackedAction {
  readonly element: HTMLElement;
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

interface TrackingState {
  actions: TrackedAction[];
  highlighted: HTMLElement | null;
}

const PRESS = UIKIT_GESTURES.press;

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
  const stateRef = useRef<TrackingState>({actions: [], highlighted: null});
  const fadesRef = useRef(new Map<Element, ReturnType<typeof setTimeout>>());
  const isEnabled = options.isEnabled ?? true;
  // When tracking turns off and when the group unmounts: drops a touch it is
  // tracking (its highlight is cut, and its lift runs nothing, as the
  // recognizer is disabled; the gesture host does not report a cancellation
  // to a disabled recognizer's listener), and ends the release fades it
  // started (their timers, and the paint each would remove): the lift that
  // runs an action usually closes the alert before its fade ends.
  useEffect(() => {
    const fades = fadesRef.current;
    const tracking = stateRef;
    return () => {
      const {highlighted} = tracking.current;
      if (highlighted?.getAttribute(PRESSED_ATTRIBUTE) === 'on') {
        highlighted.removeAttribute(PRESSED_ATTRIBUTE);
      }
      tracking.current = {actions: [], highlighted: null};
      for (const [element, timer] of fades) {
        clearTimeout(timer);
        if (element.getAttribute(PRESSED_ATTRIBUTE) === 'fading') {
          element.removeAttribute(PRESSED_ATTRIBUTE);
        }
      }
      fades.clear();
    };
  }, [isEnabled]);

  const clearFade = (element: Element) => {
    const fade = fadesRef.current.get(element);
    if (fade != null) {
      clearTimeout(fade);
      fadesRef.current.delete(element);
    }
  };
  const paint = (element: HTMLElement) => {
    clearFade(element);
    element.setAttribute(PRESSED_ATTRIBUTE, 'on');
  };
  const cut = (element: HTMLElement) => {
    clearFade(element);
    element.removeAttribute(PRESSED_ATTRIBUTE);
  };
  const release = (element: HTMLElement) => {
    clearFade(element);
    element.setAttribute(PRESSED_ATTRIBUTE, 'fading');
    fadesRef.current.set(
      element,
      setTimeout(() => {
        fadesRef.current.delete(element);
        if (element.getAttribute(PRESSED_ATTRIBUTE) === 'fading') {
          element.removeAttribute(PRESSED_ATTRIBUTE);
        }
      }, PRESS_FADE_MS),
    );
  };

  const highlight = (next: HTMLElement | null) => {
    const state = stateRef.current;
    if (next === state.highlighted) {
      return;
    }
    if (state.highlighted != null) {
      cut(state.highlighted);
    }
    state.highlighted = next;
    if (next != null) {
      paint(next);
    }
  };

  const actionAt = (x: number, y: number): HTMLElement | null => {
    const margin = optionsRef.current.highlightExpansion;
    for (const action of stateRef.current.actions) {
      if (
        x >= action.left - margin &&
        x <= action.right + margin &&
        y >= action.top - margin &&
        y <= action.bottom + margin
      ) {
        return action.element;
      }
    }
    return null;
  };

  const reset = () => {
    stateRef.current = {actions: [], highlighted: null};
  };

  return useGestureRecognizer(
    isEnabled ? ref : DETACHED,
    () =>
      new LongPressGestureRecognizer({
        name: 'ActionGroupTracking',
        minimumPressDuration: options.highlightOnsetMs,
        allowableMovement: Number.POSITIVE_INFINITY,
        allowedPointerTypes: options.pointerTypes ?? ['touch', 'pen'],
        delaysTouchesBegan: true,
        // A held finger or pen starts no text selection and opens no
        // callout on the group, as on UIKit's action rows: the gesture
        // host's selection lock, for as long as the contact is down. A mouse
        // keeps selecting text.
        selectionLock: lockSelection,
        shouldReceiveTouch: (recognizer, touch) =>
          receiveTouch(recognizer, touch, optionsRef.current),
      }),
    recognizer => {
      switch (recognizer.state) {
        case 'began': {
          const root = ref.current;
          const actions: TrackedAction[] = [];
          if (root != null) {
            for (const element of root.querySelectorAll<HTMLElement>(
              optionsRef.current.itemSelector,
            )) {
              if (element.matches(DISABLED)) {
                continue;
              }
              const rect = element.getBoundingClientRect();
              actions.push({
                element,
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
              });
            }
          }
          stateRef.current = {actions, highlighted: null};
          const {x, y} = recognizer.location();
          highlight(actionAt(x, y));
          break;
        }
        case 'changed': {
          const {x, y} = recognizer.location();
          highlight(actionAt(x, y));
          break;
        }
        case 'ended': {
          const lifted = stateRef.current.highlighted;
          reset();
          if (lifted == null) {
            break;
          }
          release(lifted);
          if (!lifted.matches(DISABLED)) {
            const activate = optionsRef.current.onActivate;
            if (activate != null) {
              activate(lifted);
            } else {
              lifted.click();
            }
          }
          break;
        }
        case 'cancelled': {
          const highlighted = stateRef.current.highlighted;
          reset();
          if (highlighted != null) {
            cut(highlighted);
          }
          break;
        }
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
