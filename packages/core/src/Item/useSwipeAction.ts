// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSwipeAction.ts
 * @input Pointer events on a row's container; the row element to translate
 * @output Exports useSwipeAction — the gesture behind Item's `swipeActions`
 * @position Internal to Item; tested through Item.test.tsx
 *
 * A native-list swipe: drag a row sideways, a labelled panel is revealed
 * behind it, release past the commit point (or fling) to fire the action, and
 * the row slides out. Release short of it and the row springs back.
 *
 * Touch only, by pointer type rather than by breakpoint: a mouse has the menu
 * and the keyboard has the verb already; the gesture is an accelerator for a
 * verb the row exposes elsewhere, never the only way to reach one.
 *
 * The axis is decided once, at 10 px of travel: a drag that is more vertical
 * than horizontal belongs to the scroller and is never claimed, so this never
 * fights a vertical list (`touch-action: pan-y` on the container lets the
 * browser keep scrolling while a claimed horizontal drag is ours). Travel past
 * the commit point meets resistance so the row reads as tethered, and a quick
 * fling commits from a shorter distance. The row's transform is written
 * straight to the element, coalesced to one write per frame, so a drag costs
 * no React render.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {PointerEvent as ReactPointerEvent, MouseEvent} from 'react';

/** Travel before the axis is decided. */
const AXIS_LOCK_PX = 10;
/** How much more horizontal than vertical a drag must be to be claimed. */
const HORIZONTAL_DOMINANCE = 1.5;
/** The commit point, as a fraction of the row's width, within the bounds below. */
const COMMIT_FRACTION = 0.32;
const MIN_COMMIT_PX = 72;
const MAX_COMMIT_PX = 160;
/** Travel past the commit point moves the row this much per pixel of finger. */
const OVERSHOOT_RESISTANCE = 0.35;
/** A release at this speed commits from FLING_MIN_PX, short of the commit point. */
const FLING_VELOCITY_PX_PER_MS = 0.6;
const FLING_MIN_PX = 44;
/** The slide-out after a commit, and the spring back after a release. */
export const SWIPE_COMMIT_MS = 200;
export const SWIPE_RELEASE_MS = 180;
/** A click the browser synthesizes after a swipe is not a tap on the row. */
const CLICK_SUPPRESS_MS = 400;

export type SwipeActionPhase = 'idle' | 'dragging' | 'committing' | 'releasing';
export type SwipeActionDirection = 'leading' | 'trailing';

export interface SwipeActionState {
  phase: SwipeActionPhase;
  /** Past the commit point: letting go now fires the action. */
  isArmed: boolean;
  direction: SwipeActionDirection;
}

export interface SwipeActionHandlers {
  onPointerDown: (event: ReactPointerEvent) => void;
  onPointerMove: (event: ReactPointerEvent) => void;
  onPointerUp: (event: ReactPointerEvent) => void;
  onPointerCancel: (event: ReactPointerEvent) => void;
  onClickCapture: (event: MouseEvent) => void;
}

export interface UseSwipeActionOptions {
  /** Off: the handlers do nothing and no row moves. */
  isEnabled: boolean;
  /** Fired once the row has slid out after a leading (rightward) swipe. */
  onCommit: () => void;
  /** Fired after a trailing (leftward) swipe; omitted, a leftward drag is not claimed. */
  onCommitTrailing?: () => void;
  /** Skip the slide and spring animations. */
  isReducedMotion?: boolean;
  /** The element that clips and receives the pointer events. */
  containerRef: React.RefObject<HTMLElement | null>;
  /** The element that translates with the finger. */
  rowRef: React.RefObject<HTMLElement | null>;
  /** Written once per frame with the revealed width, in px; the panel reads it. */
  onReveal?: (width: number, direction: SwipeActionDirection) => void;
}

export interface UseSwipeActionResult {
  state: SwipeActionState;
  handlers: SwipeActionHandlers;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  /** null until the axis is decided; false once it went to the scroller. */
  claimed: boolean | null;
  direction: SwipeActionDirection;
  lastX: number;
  lastTime: number;
  prevX: number;
  prevTime: number;
  /** Raw travel along the claimed direction, before resistance. */
  offset: number;
  commitPx: number;
}

const IDLE_STATE: SwipeActionState = {
  isArmed: false,
  direction: 'leading',
  phase: 'idle',
};

function signOf(direction: SwipeActionDirection): number {
  return direction === 'trailing' ? -1 : 1;
}

function claimDirection(
  deltaX: number,
  deltaY: number,
  hasTrailing: boolean,
): SwipeActionDirection | null {
  if (Math.abs(deltaX) <= Math.abs(deltaY) * HORIZONTAL_DOMINANCE) {
    return null;
  }
  if (deltaX >= 0) {
    return 'leading';
  }
  return hasTrailing ? 'trailing' : null;
}

function now(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

/** Move the row, with the given transition (0 = this frame). */
function translateRow(
  row: HTMLElement,
  offset: number,
  transitionMs: number,
): void {
  const transition =
    transitionMs > 0 ? `transform ${transitionMs}ms ease-out` : '';
  if (row.style.transition !== transition) {
    row.style.transition = transition;
  }
  row.style.transform = offset === 0 ? '' : `translate3d(${offset}px, 0, 0)`;
}

export function useSwipeAction({
  isEnabled,
  onCommit,
  onCommitTrailing,
  isReducedMotion = false,
  containerRef,
  rowRef,
  onReveal,
}: UseSwipeActionOptions): UseSwipeActionResult {
  const dragRef = useRef<DragState | null>(null);
  const suppressClickUntilRef = useRef(0);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef<number | null>(null);
  const pendingRef = useRef<number | null>(null);
  const [state, setState] = useState<SwipeActionState>(IDLE_STATE);

  // The latest callbacks, read by handlers and timers that outlive a render.
  const onCommitRef = useRef(onCommit);
  const onCommitTrailingRef = useRef(onCommitTrailing);
  const onRevealRef = useRef(onReveal);
  useEffect(() => {
    onCommitRef.current = onCommit;
    onCommitTrailingRef.current = onCommitTrailing;
    onRevealRef.current = onReveal;
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

  const writeTransform = useCallback(
    (offset: number, direction: SwipeActionDirection, transitionMs: number) => {
      const row = rowRef.current;
      if (!row) {
        return;
      }
      translateRow(row, offset, transitionMs);
      onRevealRef.current?.(Math.abs(offset), direction);
    },
    [rowRef],
  );

  const cancelPendingPaint = useCallback(() => {
    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = null;
    pendingRef.current = null;
  }, []);

  const paintOnNextFrame = useCallback(
    (offset: number, direction: SwipeActionDirection) => {
      pendingRef.current = offset;
      if (frameRef.current != null) {
        return;
      }
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        const next = pendingRef.current;
        pendingRef.current = null;
        if (next != null) {
          writeTransform(next, direction, 0);
        }
      });
    },
    [writeTransform],
  );

  const paint = useCallback(
    (offset: number, direction: SwipeActionDirection, transitionMs: number) => {
      cancelPendingPaint();
      writeTransform(offset, direction, transitionMs);
    },
    [cancelPendingPaint, writeTransform],
  );

  const settle = useCallback(
    (drag: DragState, commit: boolean) => {
      const container = containerRef.current;
      const sign = signOf(drag.direction);
      const travel = commit
        ? sign * ((container?.clientWidth ?? drag.offset) + 24)
        : 0;
      const duration = isReducedMotion
        ? 0
        : commit
          ? SWIPE_COMMIT_MS
          : SWIPE_RELEASE_MS;
      setState({
        isArmed: commit,
        direction: drag.direction,
        phase: commit ? 'committing' : 'releasing',
      });
      paint(travel, drag.direction, duration);
      if (settleTimerRef.current != null) {
        clearTimeout(settleTimerRef.current);
      }
      settleTimerRef.current = setTimeout(() => {
        settleTimerRef.current = null;
        if (commit) {
          if (drag.direction === 'trailing') {
            onCommitTrailingRef.current?.();
          } else {
            onCommitRef.current();
          }
        }
        paint(0, drag.direction, 0);
        setState(IDLE_STATE);
      }, duration);
    },
    [containerRef, paint, isReducedMotion],
  );

  const onPointerDown = useCallback(
    (event: ReactPointerEvent) => {
      if (!isEnabled || event.pointerType !== 'touch' || dragRef.current) {
        return;
      }
      const width = containerRef.current?.clientWidth ?? 0;
      const startTime = now();
      dragRef.current = {
        claimed: null,
        commitPx: Math.min(
          MAX_COMMIT_PX,
          Math.max(MIN_COMMIT_PX, width * COMMIT_FRACTION),
        ),
        direction: 'leading',
        lastTime: startTime,
        lastX: event.clientX,
        offset: 0,
        pointerId: event.pointerId,
        prevTime: startTime,
        prevX: event.clientX,
        startX: event.clientX,
        startY: event.clientY,
      };
    },
    [containerRef, isEnabled],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent) => {
      const drag = dragRef.current;
      if (drag == null) {
        return;
      }
      if (drag.pointerId !== event.pointerId || drag.claimed === false) {
        return;
      }
      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;
      if (drag.claimed === null) {
        if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < AXIS_LOCK_PX) {
          return;
        }
        const direction = claimDirection(
          deltaX,
          deltaY,
          onCommitTrailingRef.current != null,
        );
        drag.claimed = direction != null;
        if (direction == null) {
          return;
        }
        drag.direction = direction;
        setState({isArmed: false, direction, phase: 'dragging'});
        try {
          containerRef.current?.setPointerCapture(event.pointerId);
        } catch {
          // Pointer capture is a nicety (keeps the drag when the finger
          // leaves the row); a platform without it still drags.
        }
      }
      const sign = signOf(drag.direction);
      const raw = Math.max(0, deltaX * sign);
      const offset =
        raw <= drag.commitPx
          ? raw
          : drag.commitPx + (raw - drag.commitPx) * OVERSHOOT_RESISTANCE;
      const isArmed = raw >= drag.commitPx;
      if (isArmed !== drag.offset >= drag.commitPx) {
        setState({isArmed, direction: drag.direction, phase: 'dragging'});
      }
      drag.offset = raw;
      drag.prevX = drag.lastX;
      drag.prevTime = drag.lastTime;
      drag.lastX = event.clientX;
      drag.lastTime = now();
      paintOnNextFrame(sign * offset, drag.direction);
    },
    [containerRef, paintOnNextFrame],
  );

  const endGesture = useCallback(
    (event: ReactPointerEvent, cancelled: boolean) => {
      const drag = dragRef.current;
      if (drag == null) {
        return;
      }
      if (drag.pointerId !== event.pointerId) {
        return;
      }
      dragRef.current = null;
      if (drag.claimed !== true) {
        return;
      }
      suppressClickUntilRef.current = now() + CLICK_SUPPRESS_MS;
      try {
        containerRef.current?.releasePointerCapture(event.pointerId);
      } catch {
        // See setPointerCapture above.
      }
      if (cancelled) {
        settle(drag, false);
        return;
      }
      const elapsed = Math.max(1, drag.lastTime - drag.prevTime);
      const velocity =
        (signOf(drag.direction) * (drag.lastX - drag.prevX)) / elapsed;
      const flung =
        velocity >= FLING_VELOCITY_PX_PER_MS && drag.offset >= FLING_MIN_PX;
      settle(drag, drag.offset >= drag.commitPx || flung);
    },
    [containerRef, settle],
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent) => endGesture(event, false),
    [endGesture],
  );
  const onPointerCancel = useCallback(
    (event: ReactPointerEvent) => endGesture(event, true),
    [endGesture],
  );
  const onClickCapture = useCallback((event: MouseEvent) => {
    if (now() >= suppressClickUntilRef.current) {
      return;
    }
    suppressClickUntilRef.current = 0;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return {
    handlers: {
      onClickCapture,
      onPointerCancel,
      onPointerDown,
      onPointerMove,
      onPointerUp,
    },
    state,
  };
}
