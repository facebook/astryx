// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSwipeAction.ts
 * @input The row root (the element that translates); the swipe panels,
 *   whose parent the gesture attaches to; the gesture foundation's
 *   PanGestureRecognizer; the UIKit constants table and swipeRelease.ts
 * @output Exports useSwipeAction — the gesture behind Item's `swipeActions`
 * @position Internal to Item, through ItemSwipeLayer (the only module that
 *   imports it); tested through Item.test.tsx
 *
 * A native-list swipe: drag a row sideways and the side's panel is uncovered.
 * Under `reveal` a release past half the panel leaves the row resting open
 * with every entry tappable, and a long drag or a fling fires the outermost
 * entry; under `commit` a release past the commit point slides the row out
 * and fires the outermost entry, and nothing rests. After an entry fires the
 * row springs back, or holds out when the entry has `hasRemoval`. A release
 * short of the threshold springs back under both.
 *
 * A finger or a pen, never a mouse (the recognizer's pointer types), by
 * pointer type rather than by breakpoint: a mouse has the row's own controls
 * and a keyboard has the verb already; the gesture is an accelerator for a
 * verb the row exposes elsewhere, never the only way to reach one.
 *
 * The pan is the gesture foundation's, published as `Item.swipe` so an app
 * can relate its own recognizers to it. It claims the touch after 8 px of
 * sideways travel (a drag more vertical than horizontal belongs to the
 * scroller and fails it), toward a side with entries or on a resting row: a
 * browser commits to scrolling a touch at about 10 px, so the row must claim
 * before that. The swipe itself begins where UIKit's does, after 25 px, from
 * 0, and in between nothing moves. The pan reads each touch's pointer, as
 * `spec:AST-057` says: a finger or a pen swipes the row whatever the primary
 * pointer and a mouse never starts it, one rule on every device. The
 * foundation tells the browser (`touch-action: pan-y pinch-zoom`,
 * `touchmove` cancelled only while the pan owns the touch, the click the
 * browser synthesizes swallowed) and leaves a pinch to the page: a second
 * finger that lands before the claim fails the one-finger pan and leaves its
 * touch to the browser's pinch, and once the row has claimed its finger a
 * second finger leaves the swipe going (spec:AST-094 FR10).
 *
 * The drag's travel is one custom property written on the root, coalesced to
 * one write per frame; the root's transform reads it and the panels'
 * transforms read its negation, so the row moves and the panel appears fixed
 * in the space the row vacates. Settling (the spring back, the slide out)
 * writes a duration the same elements read as their transition clock, so
 * everything derived from the travel moves together. A drag costs no React
 * render; the claim and the settle each cost one.
 *
 * Directions are logical: `leading` is a drag toward the inline end and
 * `trailing` a drag toward the inline start, read against the root's computed
 * `direction` when the touch is claimed and written beside the travel as a
 * sign the transforms multiply by, so under `dir="rtl"` the finger, the
 * uncovered edge and the panel's logical inset agree.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {KeyboardEvent as ReactKeyboardEvent} from 'react';
import {PanGestureRecognizer, useGestureRecognizer} from '../gestures';
import {isRtlElement} from '../hooks/isRtlElement';
import {swipeActions as SWIPE} from '../motion/uikit/swipeActions';
import {commitPoint, resistedTravel} from './swipeRelease';

/** The travel, in physical px, written on the row root during a drag. */
export const SWIPE_TRAVEL_PROPERTY = '--_item-swipe-travel';
/** +1 when the inline end is to the right (LTR), -1 under RTL. */
export const SWIPE_DIRECTION_PROPERTY = '--_item-swipe-dir';
/** The clock a settle runs on; `0s` while the finger drives the row. */
export const SWIPE_DURATION_PROPERTY = '--_item-swipe-duration';

/** Under `reveal`, a release this far into the panel rests the row open. */
const REST_FRACTION = 0.5;
/** A release at this speed (px/s) commits from FLING_MIN_PX, short of the commit point. */
const FLING_VELOCITY = 600;
const FLING_MIN_PX = 44;
/** The slide-out after a commit, and the spring back after a release. */
export const SWIPE_SETTLE_MS = 200;

export type SwipeSide = 'leading' | 'trailing';
export type SwipeBehavior = 'reveal' | 'commit';
export type SwipePhase =
  /** At rest, closed. */
  | 'idle'
  /** The finger drives the row. */
  | 'dragging'
  /** Springing back or sliding out, on the settle clock. */
  | 'settling'
  /** Resting open with the side's panel tappable (`reveal` only). */
  | 'resting'
  /** Slid out after an entry with `hasRemoval` fired. */
  | 'held';

export interface SwipeState {
  phase: SwipePhase;
  /** The side whose panel is uncovered, or will be. */
  side: SwipeSide;
  /** Past the commit point: letting go now fires the outermost entry. */
  isArmed: boolean;
}

export interface UseSwipeActionOptions {
  behavior: SwipeBehavior;
  /** Which sides have entries. A drag toward a side without any is not claimed. */
  sides: {leading: boolean; trailing: boolean};
  /** The natural width of a side's panel, read when a drag begins. */
  measurePanel: (side: SwipeSide) => number;
  /**
   * Fire the side's outermost entry. Returns whether the row holds out
   * afterwards (the entry's `hasRemoval`).
   */
  fireOutermost: (side: SwipeSide) => boolean;
  /** Skip the slide and spring animations. */
  isReducedMotion?: boolean;
  /** The row root: the element that translates. */
  rootRef: React.RefObject<HTMLElement | null>;
}

export interface UseSwipeActionResult {
  state: SwipeState;
  /**
   * For each panel: a panel is a child of the row root, and its ref is set
   * before this hook's layout effects run (a ref on the root itself is set
   * after them), so the gesture attaches to the root through it.
   */
  panelRef: (element: HTMLElement | null) => void;
  /**
   * A resting panel's entry was tapped: fire it, then hold the row out
   * (`hasRemoval`) or close.
   */
  activateEntry: (fire: () => boolean) => void;
  /** Close a resting row. */
  close: () => void;
  /** Escape closes a resting row with focus inside it. */
  onKeyDown: (event: ReactKeyboardEvent) => void;
}

interface DragState {
  side: SwipeSide;
  inlineSign: 1 | -1;
  panelWidth: number;
  commitPx: number;
  /** The state the row had when the touch was claimed, for a swipe that never began. */
  previous: SwipeState;
  /** Past UIKit's threshold: the row follows the finger. */
  started: boolean;
  /** Which way the finger crossed the threshold: +1 toward the side, -1 away. */
  startSign: number;
  /** The travel the row already had when the touch was claimed (a resting row). */
  baseTravel: number;
  /** Logical travel toward the side, before resistance. */
  travel: number;
}

const IDLE_STATE: SwipeState = {isArmed: false, phase: 'idle', side: 'leading'};

/** The logical sign of a side: +1 toward the inline end, -1 toward the start. */
function signOf(side: SwipeSide): number {
  return side === 'trailing' ? -1 : 1;
}

/**
 * The first focusable thing in the row outside its swipe panels, for focus to
 * land on when a resting panel closes under it.
 */
function focusRowContent(root: HTMLElement): void {
  const candidates = root.querySelectorAll<HTMLElement>(
    'button, a[href], input, [tabindex]:not([tabindex="-1"])',
  );
  for (const el of candidates) {
    if (el.closest('[data-swipe-panel]') == null) {
      el.focus();
      return;
    }
  }
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

/**
 * What swipes a row: a finger or a pen, never a mouse (a mouse has the row's
 * own controls).
 */
const SWIPE_POINTER_TYPES = ['touch', 'pen'] as const;

export function useSwipeAction({
  behavior,
  sides,
  measurePanel,
  fireOutermost,
  isReducedMotion = false,
  rootRef,
}: UseSwipeActionOptions): UseSwipeActionResult {
  const dragRef = useRef<DragState | null>(null);
  const travelRef = useRef(0);
  const inlineSignRef = useRef<1 | -1>(1);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef<number | null>(null);
  const pendingRef = useRef<number | null>(null);
  /** The root as the gesture finds it: the parent of a panel. */
  const gestureRootRef = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<SwipeState>(IDLE_STATE);
  const stateRef = useRef(state);
  stateRef.current = state;

  // The latest callbacks, read by listeners and timers that outlive a render.
  const measurePanelRef = useRef(measurePanel);
  const fireOutermostRef = useRef(fireOutermost);
  const sidesRef = useRef(sides);
  const behaviorRef = useRef(behavior);
  const reducedMotionRef = useRef(isReducedMotion);
  useEffect(() => {
    measurePanelRef.current = measurePanel;
    fireOutermostRef.current = fireOutermost;
    sidesRef.current = sides;
    behaviorRef.current = behavior;
    reducedMotionRef.current = isReducedMotion;
  });

  useEffect(
    () => () => {
      if (settleTimerRef.current != null) {
        clearTimeout(settleTimerRef.current);
      }
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
      }
    },
    [],
  );

  const panelRef = useCallback((element: HTMLElement | null) => {
    if (element?.parentElement != null) {
      gestureRootRef.current = element.parentElement;
    }
  }, []);

  /** Write the travel (physical px) the transforms read. */
  const writeTravel = useCallback(
    (travel: number) => {
      const root = rootRef.current;
      if (!root) {
        return;
      }
      travelRef.current = travel;
      root.style.setProperty(SWIPE_TRAVEL_PROPERTY, `${travel}px`);
    },
    [rootRef],
  );

  const writeDuration = useCallback(
    (ms: number) => {
      const root = rootRef.current;
      if (!root) {
        return;
      }
      if (ms > 0) {
        root.style.setProperty(SWIPE_DURATION_PROPERTY, `${ms}ms`);
      } else {
        root.style.setProperty(SWIPE_DURATION_PROPERTY, '0s');
      }
    },
    [rootRef],
  );

  const clearInlineProperties = useCallback(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    root.style.removeProperty(SWIPE_TRAVEL_PROPERTY);
    root.style.removeProperty(SWIPE_DIRECTION_PROPERTY);
    root.style.removeProperty(SWIPE_DURATION_PROPERTY);
    travelRef.current = 0;
  }, [rootRef]);

  const cancelPendingPaint = useCallback(() => {
    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = null;
    pendingRef.current = null;
  }, []);

  /** One write per frame while the finger drives the row. */
  const paintOnNextFrame = useCallback(
    (travel: number) => {
      pendingRef.current = travel;
      if (frameRef.current != null) {
        return;
      }
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        const next = pendingRef.current;
        pendingRef.current = null;
        if (next != null) {
          writeTravel(next);
        }
      });
    },
    [writeTravel],
  );

  /**
   * Move the row to `travel` on the settle clock, then land in `phase`. A
   * zero clock (reduced motion) lands at once.
   */
  const settle = useCallback(
    (
      side: SwipeSide,
      travel: number,
      phase: 'idle' | 'resting' | 'held',
      afterSlide?: () => boolean,
    ) => {
      cancelPendingPaint();
      const duration = reducedMotionRef.current ? 0 : SWIPE_SETTLE_MS;
      setState({isArmed: false, phase: 'settling', side});
      writeDuration(duration);
      writeTravel(travel);
      if (settleTimerRef.current != null) {
        clearTimeout(settleTimerRef.current);
      }
      settleTimerRef.current = setTimeout(() => {
        settleTimerRef.current = null;
        writeDuration(0);
        // A settle that fires an entry may start the spring back itself; the
        // landing below is then that settle's to make.
        if (afterSlide?.() === true) {
          return;
        }
        if (phase === 'idle') {
          clearInlineProperties();
        }
        setState(phase === 'idle' ? IDLE_STATE : {isArmed: false, phase, side});
      }, duration);
    },
    [cancelPendingPaint, clearInlineProperties, writeDuration, writeTravel],
  );

  /** How far out a row goes when an entry fires and the row leaves (physical px). */
  const outTravel = useCallback(
    (side: SwipeSide, inlineSign: 1 | -1) =>
      signOf(side) *
      inlineSign *
      ((rootRef.current?.clientWidth ?? 0) + SWIPE.slideOutOvershoot),
    [rootRef],
  );

  /**
   * The outermost entry fires. Under both models the row first travels to
   * its slide-out, fires, then holds out (`hasRemoval`) or springs back.
   */
  const slideOutAndFire = useCallback(
    (side: SwipeSide, inlineSign: 1 | -1) => {
      settle(side, outTravel(side, inlineSign), 'held', () => {
        const holdsOut = fireOutermostRef.current(side);
        if (holdsOut) {
          return false;
        }
        settle(side, 0, 'idle');
        return true;
      });
    },
    [outTravel, settle],
  );

  const close = useCallback(() => {
    const current = stateRef.current;
    if (current.phase !== 'resting') {
      return;
    }
    const root = rootRef.current;
    if (root != null && root.contains(document.activeElement)) {
      focusRowContent(root);
    }
    settle(current.side, 0, 'idle');
  }, [rootRef, settle]);

  // A resting row closes on a pointer landing anywhere outside it, which is
  // also how a drag on a neighbour closes it: one row rests open at a time
  // with no shared state.
  useEffect(() => {
    if (state.phase !== 'resting') {
      return undefined;
    }
    const onOutside = (event: PointerEvent) => {
      const root = rootRef.current;
      if (
        root != null &&
        event.target instanceof Node &&
        !root.contains(event.target)
      ) {
        close();
      }
    };
    document.addEventListener('pointerdown', onOutside, true);
    return () => {
      document.removeEventListener('pointerdown', onOutside, true);
    };
  }, [close, rootRef, state.phase]);

  const activateEntry = useCallback(
    (fire: () => boolean) => {
      const current = stateRef.current;
      if (current.phase !== 'resting') {
        return;
      }
      const root = rootRef.current;
      if (root != null && root.contains(document.activeElement)) {
        focusRowContent(root);
      }
      const holdsOut = fire();
      if (holdsOut) {
        settle(
          current.side,
          outTravel(current.side, inlineSignRef.current),
          'held',
        );
      } else {
        settle(current.side, 0, 'idle');
      }
    },
    [outTravel, rootRef, settle],
  );

  // ---------------------------------------------------------------------------
  // The pan

  /** The side a drag from a closed row uncovers: toward the inline end is leading. */
  const sideFor = (dx: number, inlineSign: 1 | -1): SwipeSide =>
    dx * inlineSign > 0 ? 'leading' : 'trailing';

  const begin = (pan: PanGestureRecognizer) => {
    const current = stateRef.current;
    const inlineSign: 1 | -1 = isRtlElement(rootRef.current) ? -1 : 1;
    inlineSignRef.current = inlineSign;
    // From rest, the drag continues the open side (closing it or going
    // further); from closed, the drag's direction names the side.
    const side =
      current.phase === 'resting'
        ? current.side
        : sideFor(pan.totalTranslation().x, inlineSign);
    const panelWidth = measurePanelRef.current(side);
    dragRef.current = {
      // Logical: the physical travel through the inline sign.
      baseTravel: Math.max(0, travelRef.current * inlineSign * signOf(side)),
      commitPx: commitPoint(panelWidth, rootRef.current?.clientWidth ?? 0),
      inlineSign,
      panelWidth,
      previous: current,
      side,
      started: false,
      startSign: 1,
      travel: 0,
    };
    track(pan);
  };

  const track = (pan: PanGestureRecognizer) => {
    const drag = dragRef.current;
    if (drag == null) {
      return;
    }
    const sign = signOf(drag.side);
    // The finger's travel toward the side since it landed.
    const along = pan.totalTranslation().x * drag.inlineSign * sign;
    // UIKit's dead zone: the swipe counts from where the finger crosses it.
    const threshold = SWIPE.hysteresis;
    if (!drag.started) {
      if (Math.abs(along) < threshold) {
        return;
      }
      drag.started = true;
      drag.startSign = Math.sign(along);
      rootRef.current?.style.setProperty(
        SWIPE_DIRECTION_PROPERTY,
        String(drag.inlineSign),
      );
      writeDuration(0);
      setState({isArmed: false, phase: 'dragging', side: drag.side});
    }
    // The threshold's travel is not part of the swipe, as in UIKit: the
    // swipe counts from where the finger crossed it.
    const swipe = along - drag.startSign * threshold;
    const raw = Math.max(0, drag.baseTravel + swipe);
    const isArmed = raw >= drag.commitPx;
    if (isArmed !== drag.travel >= drag.commitPx) {
      setState({isArmed, phase: 'dragging', side: drag.side});
    }
    drag.travel = raw;
    paintOnNextFrame(
      sign * drag.inlineSign * resistedTravel(raw, drag.commitPx),
    );
  };

  const release = (pan: PanGestureRecognizer) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag == null) {
      return;
    }
    if (!drag.started) {
      // A claimed touch that never became a swipe: the row carries on.
      setState(drag.previous);
      return;
    }
    const {side, inlineSign} = drag;
    const velocity = pan.velocity().x * signOf(side) * inlineSign;
    const flung = velocity >= FLING_VELOCITY && drag.travel >= FLING_MIN_PX;
    if (drag.travel >= drag.commitPx || flung) {
      slideOutAndFire(side, inlineSign);
      return;
    }
    if (
      behaviorRef.current === 'reveal' &&
      drag.travel >= drag.panelWidth * REST_FRACTION
    ) {
      settle(side, signOf(side) * inlineSign * drag.panelWidth, 'resting');
      return;
    }
    settle(side, 0, 'idle');
  };

  const cancel = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag == null) {
      return;
    }
    if (!drag.started) {
      setState(drag.previous);
      return;
    }
    settle(drag.side, 0, 'idle');
  };

  useGestureRecognizer(
    gestureRootRef,
    () =>
      new PanGestureRecognizer({
        allowedPointerTypes: SWIPE_POINTER_TYPES,
        direction: 'horizontal',
        hysteresis: SWIPE.claim,
        maximumNumberOfTouches: 1,
        name: 'Item.swipe',
        shouldBegin: pan => {
          const current = stateRef.current;
          if (current.phase === 'settling' || current.phase === 'held') {
            return false;
          }
          if (current.phase === 'resting') {
            return true;
          }
          const inlineSign: 1 | -1 = isRtlElement(rootRef.current) ? -1 : 1;
          return sidesRef.current[
            sideFor(pan.totalTranslation().x, inlineSign)
          ];
        },
      }),
    pan => {
      switch (pan.state) {
        case 'began':
          begin(pan);
          break;
        case 'changed':
          track(pan);
          break;
        case 'ended':
          release(pan);
          break;
        case 'cancelled':
          cancel();
          break;
        case 'possible':
        case 'failed':
          break;
      }
    },
    // `spec:AST-057` reads each event's pointer: a finger or a pen swipes the
    // row on every device and a mouse never does, so the host's fine-pointer
    // gate (`spec:AST-094` FR19) does not apply to it.
    {perEventPointer: true},
  );

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent) => {
      if (event.key === 'Escape' && stateRef.current.phase === 'resting') {
        event.stopPropagation();
        close();
      }
    },
    [close],
  );

  return {activateEntry, close, onKeyDown, panelRef, state};
}
