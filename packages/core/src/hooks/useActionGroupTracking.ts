// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useActionGroupTracking.ts
 * @input A ref to a group of sibling actions, the actions' selector, and the
 *   component's tracking constants
 * @output Exports useActionGroupTracking, ActionGroupTrackingOptions,
 *   resolveNearestAction (the finger resolution every group whose targets
 *   grow shares) and POINTER_PRESS_ATTRIBUTE (the mark on the action a
 *   pointer press began on)
 * @position Internal hook (not exported from the hooks entry): the long
 *   press that drives the shared action-group tracker
 *   (`hooks/actionGroupTracker.ts`) for a group a held pointer slides
 *   across (`family:action-groups`); consumed by AlertDialog, ButtonGroup
 *   and ToggleButtonGroup
 *
 * A group of sibling actions behaves like a menu under a press
 * (`family:action-groups` FR1–FR5, `spec:AST-094` FR26–FR28): the action
 * under the pointer highlights, the highlight follows the pointer from
 * action to action (nothing over a gap, a disabled action, or outside the
 * group), and the lift runs the action under the pointer, once, through its
 * own click, and leaves focus where a click on it would (FR1); a lift
 * outside the group, a cancelled pointer, a second finger or the window
 * losing focus runs nothing. The tracking itself, the rects read once when
 * the press begins, the highlight and its release fade, and the lift's
 * click, is the shared tracker's; this hook only drives it, and reads the
 * group's disabled actions and untracked members once per finger press for a
 * caller that resolves the finger itself.
 *
 * One recognizer drives it: a long press with no minimum duration and no
 * movement limit, so it begins on the press, claims it (nothing under the
 * finger scrolls) and swallows the browser's click for it. Inside a scroller
 * a finger first waits the scroll view's content-touch delay without
 * travelling past the press slop, so a flick still scrolls; a mouse or a pen
 * does not wait. The actions' own press
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
import {lockSelection} from '../utils/selectionLock';
import type {GestureTouch, PointerKind} from '../gestures/types';
import {useGestureRecognizer} from '../gestures/useGestureRecognizer';
import {UIKIT_PRESS} from '../motion/uikit/gestures';
import {resolveHitTarget} from '../utils/hitArea';
import {IOS_SUPPORTS_QUERY} from '../utils/touchPresentation';
import {
  createActionGroupTracker,
  type ActionGroupTarget,
} from './actionGroupTracker';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';

export interface ActionGroupTrackingOptions {
  /** Selects the actions inside the tracked element. */
  itemSelector: string;
  /** How long after touch-down the touched action highlights, ms. */
  highlightOnsetMs: number;
  /**
   * How far outside an action a finger keeps it highlighted, px. A mouse or a
   * pen hit-tests the actions' exact rects (`family:action-groups` FR5).
   */
  highlightExpansion: number;
  /**
   * Picks the action under a finger from the actions measured when the press
   * begins, in place of the flat `highlightExpansion` margin: a group whose
   * touch targets grow toward 44 px resolves the nearest action
   * (`resolveNearestAction`). `neighbours` holds what a finger must not
   * reach through, measured once at the same time: the group's disabled
   * actions and the interactive members it does not track, so a group can
   * keep a finger on one of them from resolving to an action beside it. A mouse or a pen hit-tests the exact
   * rects.
   */
  resolveTarget?: (
    x: number,
    y: number,
    targets: ReadonlyArray<ActionGroupTarget>,
    neighbours: ReadonlyArray<ActionGroupTarget>,
  ) => HTMLElement | null;
  /** Pointers that are tracked; others keep the browser's click. @default every pointer */
  pointerTypes?: ReadonlyArray<PointerKind>;
  /** A press whose target this rejects is not tracked. */
  shouldTrack?: (target: unknown) => boolean;
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

/**
 * Whether a tap on a button gives it focus here. A tap's focusing runs on the
 * mousedown that follows the touch, which the claimed touch cancels with its
 * click, so the group does it for the lifted action. iOS WebKit focuses no
 * tapped button; Chromium and Firefox do.
 */
function tapFocusesButtons(): boolean {
  // Not every environment has `CSS.supports` (jsdom has `CSS.escape` only).
  return !(
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports(IOS_SUPPORTS_QUERY)
  );
}

/** The actions the tracker skips, as its own measure does. */
const DISABLED = ':disabled, [aria-disabled="true"]';

/**
 * What a finger can land on besides the group's actions: a member the group
 * does not track (a menu's trigger, a toggle without a value) keeps its own
 * target (`spec:AST-094` FR42).
 */
const INTERACTIVE =
  'button, [role="button"], a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const NO_TARGETS: ReadonlyArray<ActionGroupTarget> = [];

/**
 * Marks the action a pointer press the group tracks began on, while that
 * press runs. The press's `:active` stays on that action as the pointer
 * slides away, so a tracked button's keyboard-press arms
 * (`:active:focus-visible`, Button.tsx) step aside for it: a keyboard-focused
 * action the press began on does not look pressed beside the one under the
 * pointer (`family:action-groups` FR2).
 */
export const POINTER_PRESS_ATTRIBUTE = 'data-astryx-pointer-press';

/**
 * The action under a finger: the nearest of the press's enabled actions whose
 * target, grown toward 44 px and clamped against its neighbours, holds the
 * point (utils/hitArea.ts `resolveHitTarget`). The disabled actions and the
 * members the group does not track count as neighbours, so a point on one,
 * or nearer one than any enabled action, resolves to none: nothing is
 * highlighted over a disabled action (`family:action-groups` FR2), and no
 * grown target reaches into another member's own (`spec:AST-094` FR42).
 * Every group whose targets grow uses this, so the groups resolve a finger
 * alike.
 */
export function resolveNearestAction(
  x: number,
  y: number,
  targets: ReadonlyArray<ActionGroupTarget>,
  neighbours: ReadonlyArray<ActionGroupTarget>,
): HTMLElement | null {
  const index = resolveHitTarget(
    x,
    y,
    neighbours.length === 0 ? targets : [...targets, ...neighbours],
  );
  return index >= 0 && index < targets.length ? targets[index].element : null;
}

/**
 * The neighbours inside `root` a finger must not reach through, with their
 * boxes, read once: the disabled actions, and every interactive member the
 * group does not track.
 */
function measureNeighbours(
  root: HTMLElement | null,
  itemSelector: string,
): ReadonlyArray<ActionGroupTarget> {
  if (root == null) {
    return NO_TARGETS;
  }
  const neighbours: ActionGroupTarget[] = [];
  for (const element of root.querySelectorAll<HTMLElement>(
    `${itemSelector}, ${INTERACTIVE}`,
  )) {
    const tracked = element.matches(itemSelector);
    // A tracked action is a target unless it is disabled; an untracked one
    // nested inside a tracked action is part of that action.
    const neighbour = tracked
      ? element.matches(DISABLED)
      : element.parentElement?.closest(itemSelector) == null;
    if (neighbour) {
      const {left, top, right, bottom} = element.getBoundingClientRect();
      neighbours.push({element, left, top, right, bottom});
    }
  }
  return neighbours;
}

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
  // The pointer that started the current press: the hit expansion is a
  // finger's alone, so a mouse or a pen hit-tests the actions' exact rects
  // (`family:action-groups` FR5).
  const pointerRef = useRef<PointerKind>('touch');
  // The group's disabled actions, read once when a finger's press begins,
  // for the caller's `resolveTarget`: nothing is read per move.
  const neighboursRef = useRef(NO_TARGETS);
  // The action the running pointer press began on, carrying the mark.
  const markedRef = useRef<HTMLElement | null>(null);
  const unmark = () => {
    markedRef.current?.removeAttribute(POINTER_PRESS_ATTRIBUTE);
    markedRef.current = null;
  };
  const [tracker] = useState(() => {
    const resolveTarget = (
      x: number,
      y: number,
      targets: ReadonlyArray<ActionGroupTarget>,
    ) =>
      optionsRef.current.resolveTarget?.(
        x,
        y,
        targets,
        neighboursRef.current,
      ) ?? null;
    return createActionGroupTracker(() => ({
      roots: () => [ref.current],
      itemSelector: optionsRef.current.itemSelector,
      highlightExpansion:
        pointerRef.current === 'touch'
          ? optionsRef.current.highlightExpansion
          : 0,
      // The caller's choice, like the expansion, is a finger's: a mouse or a
      // pen hit-tests the exact rects (`family:action-groups` FR5).
      resolveTarget:
        pointerRef.current === 'touch' &&
        optionsRef.current.resolveTarget != null
          ? resolveTarget
          : undefined,
      onActivate: optionsRef.current.onActivate,
      // The browser's own click for a press the group ran is taken, so the
      // action runs once: the gesture host swallows it for a press it claims,
      // and this covers one it does not (a mouse where the primary pointer is
      // coarse). An activation with no click count always passes.
      swallowsNativeClick: true,
    }));
  });
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
      unmark();
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
        shouldReceiveTouch: (recognizer, touch) => {
          if (recognizer.numberOfTouches === 0) {
            pointerRef.current = touch.pointerType;
          }
          return receiveTouch(recognizer, touch, optionsRef.current);
        },
      }),
    recognizer => {
      switch (recognizer.state) {
        case 'began': {
          const {x, y} = recognizer.location();
          neighboursRef.current =
            pointerRef.current === 'touch' &&
            optionsRef.current.resolveTarget != null
              ? measureNeighbours(ref.current, optionsRef.current.itemSelector)
              : NO_TARGETS;
          tracker.begin(x, y);
          markedRef.current = tracker.beganOn;
          markedRef.current?.setAttribute(POINTER_PRESS_ATTRIBUTE, '');
          break;
        }
        case 'changed': {
          const {x, y} = recognizer.location();
          tracker.move(x, y);
          break;
        }
        case 'ended': {
          const beganOn = tracker.beganOn;
          const doc = ref.current?.ownerDocument;
          const focusedBefore = doc?.activeElement ?? null;
          // Whether a click on the lifted action would focus it. A mouse's or
          // a pen's press shows the engine's answer: its own pointerdown
          // focused the action it began on, as an engine that focuses a
          // pressed button does (Safari's buttons take no focus from a
          // press). A finger's tap does its focusing after the lift, on the
          // mousedown the claimed touch cancels, so it is the platform's.
          const clickFocuses =
            pointerRef.current === 'touch'
              ? tapFocusesButtons()
              : beganOn != null && focusedBefore === beganOn;
          const lifted = tracker.end();
          neighboursRef.current = NO_TARGETS;
          unmark();
          // After the lift, focus does what a click on the lifted action does
          // (`family:action-groups` FR1): the lift runs that action's own
          // `click()`, which moves no focus, so focus moves to it, unless that
          // click moved focus itself. The press was a pointer's, so no
          // keyboard ring.
          if (
            clickFocuses &&
            lifted != null &&
            lifted.isConnected &&
            doc != null &&
            doc.activeElement === focusedBefore &&
            focusedBefore !== lifted
          ) {
            lifted.focus({preventScroll: true, focusVisible: false});
          }
          break;
        }
        case 'cancelled':
          neighboursRef.current = NO_TARGETS;
          unmark();
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
 * The recognizer's should-receive delegate: it declines a touch the caller
 * rejects and a press with a modifier key held, which the browser handles.
 * It also picks the clock for the pointer that starts a press: a finger
 * inside a scroller waits the scroll view's content-touch delay and fails
 * past the press slop, so the scroller takes a flick; a mouse or a pen, and a
 * finger anywhere else, begins at once with no movement limit (`spec:AST-094`
 * FR11: the wait is a finger's).
 */
function receiveTouch(
  recognizer: LongPressGestureRecognizer,
  touch: GestureTouch,
  options: ActionGroupTrackingOptions,
): boolean {
  if (options.shouldTrack?.(touch.target) === false) {
    return false;
  }
  // A press with a modifier key held is the browser's: on a link it opens a
  // new tab or window, and an action's own click must see the key. The group
  // tracks nothing, runs no click of its own and swallows none.
  if (touch.ctrlKey || touch.metaKey || touch.shiftKey || touch.altKey) {
    return false;
  }
  if (recognizer.numberOfTouches === 0) {
    const isInsideScroller =
      touch.pointerType === 'touch' && touch.scroll?.isInsideScroller === true;
    recognizer.minimumPressDuration = isInsideScroller
      ? PRESS.contentTouchDelay.value
      : options.highlightOnsetMs;
    recognizer.allowableMovement = isInsideScroller
      ? PRESS.slop.value
      : Number.POSITIVE_INFINITY;
  }
  return true;
}
