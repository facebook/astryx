// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSheetGestures.ts
 * @input Uses React (useCallback, useEffect, useMemo, useRef, useState)
 * @output Exports useSheetGestures hook and its option/result types
 * @position Internal to BottomSheet; not exported from the lab entry point
 *
 * Drag + snap machinery for the bottom sheet. Tracks a pointer drag down the
 * block axis, translates the sliding surface live, and on release either
 * settles to the nearest snap detent (a slow drag) or dismisses (a fast flick
 * down). A fast flick up expands to the tallest detent. This is the core
 * behavior split the sheet needs: DRAG places, SWIPE closes.
 *
 * Kept private to BottomSheet: a dismiss edge + detents on a bottom-anchored
 * surface are inherently sheet concepts. It is not a general primitive and is
 * intentionally not exported.
 *
 * SSR-safe: no window/document access at module scope; all measurement
 * happens inside handlers. Respects prefers-reduced-motion by skipping the
 * settle transition.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/BottomSheet/useSheetGestures.doc.mjs
 * - /packages/lab/src/BottomSheet/useSheetGestures.test.ts
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';

// A "flick" is a fast gesture that dismisses (down) or expands (up),
// independent of where the drag ends. To avoid firing on small quick
// adjustments it must clear BOTH a speed and a distance floor — matching the
// common touch-sheet convention (a quick, deliberate throw, not a nudge).
const FLICK_VELOCITY = 1.2; // px/ms
const FLICK_MIN_DISTANCE = 48; // px traveled during the gesture
// On a slow drag below the shortest detent, dismiss once dragged past it by
// more than this fraction of that detent's height; otherwise snap back to it.
const DISMISS_OVERSHOOT_RATIO = 0.4;
// Within this many px of a detent, the live drag is magnetically eased toward
// it so it "clicks" into place instead of hovering just off the mark.
const MAGNET_RANGE = 28;
// Rubber-band resistance when dragging past the tallest detent (above the
// top): the surface still moves, but at a fraction of the finger so it feels
// tethered, then springs back to the top on release.
const OVERSCROLL_RESISTANCE = 0.35;

// Fire a short haptic tick when settling on a detent, where supported. iOS
// Safari does NOT implement navigator.vibrate (its Taptic engine isn't exposed
// to the web), so this is effectively an Android-Chrome progressive
// enhancement — a no-op elsewhere. Skipped under reduced-motion.
function hapticTick(): void {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.vibrate !== 'function'
  ) {
    return;
  }
  if (prefersReducedMotion()) {
    return;
  }
  navigator.vibrate(8);
}

// Pull a value toward the nearest of `targets` when within MAGNET_RANGE, easing
// the last stretch so the surface settles crisply onto a detent while dragging.
function magnetize(value: number, targets: number[]): number {
  let nearestTarget = targets[0];
  let nearestDist = Math.abs(value - nearestTarget);
  for (const t of targets) {
    const d = Math.abs(value - t);
    if (d < nearestDist) {
      nearestDist = d;
      nearestTarget = t;
    }
  }
  if (nearestDist >= MAGNET_RANGE) {
    return value;
  }
  // Ease-in over the range: pull grows as you approach (t^2), so the click
  // feels magnetic near the detent but doesn't fight a deliberate drag-through.
  const t = nearestDist / MAGNET_RANGE;
  const pull = 1 - t * t;
  return value + (nearestTarget - value) * pull;
}

export interface UseSheetGesturesOptions {
  /** Whether the owning sheet is open. Drag state resets when it closes. */
  isOpen: boolean;
  /** Called on a swipe-to-close (fast downward flick, or drag past the floor). */
  onDismiss: () => void;
  /**
   * Resolver for candidate detent heights in px BELOW the full sheet height.
   * Called lazily at the start of each drag so the values stay current (e.g.
   * after a rotation or the virtual keyboard opening) without a persistent
   * resize listener. The measured full height is always the tallest detent,
   * so the effective detent set is `[...snapHeights(), fullHeight]`. Omit for
   * a single-height sheet (a drag then only dismisses or springs back).
   */
  snapHeights?: () => number[];
  /** Notified when the settled detent height (px) changes. */
  onSnap?: (heightPx: number) => void;
  /**
   * Called on every drag frame with how close the sheet is to dismissing:
   * 0 while at or above the shortest detent, ramping to 1 as the drag crosses
   * into the close zone below it. Drives affordances like fading the scrim.
   */
  onDragProgress?: (dismissProgress: number) => void;
}

export interface SheetContentProps {
  style: CSSProperties;
}

export interface SheetHandleProps {
  style: CSSProperties;
  onPointerDown: (event: ReactPointerEvent) => void;
  onPointerMove: (event: ReactPointerEvent) => void;
  onPointerUp: (event: ReactPointerEvent) => void;
  onPointerCancel: (event: ReactPointerEvent) => void;
}

export interface SheetBodyProps {
  onPointerDown: (event: ReactPointerEvent) => void;
  onPointerMove: (event: ReactPointerEvent) => void;
  onPointerUp: (event: ReactPointerEvent) => void;
  onPointerCancel: (event: ReactPointerEvent) => void;
}

export interface UseSheetGesturesResult {
  /** Spread on the sliding surface: live translate + touch-action guard. */
  contentProps: SheetContentProps;
  /** Spread on the grab-handle element: pointer drag handlers. */
  handleProps: SheetHandleProps;
  /**
   * Spread on the scrollable body. An overscroll-at-top pull-down starts a
   * sheet drag (a larger, more forgiving target when the content isn't itself
   * scrolling); normal scrolling passes through untouched.
   */
  bodyProps: SheetBodyProps;
  /** Current live drag translate in px (0 = fully expanded, larger = collapsed). */
  dragOffset: number;
  /** Translate of the resting detent in px (0 = tallest detent). */
  settledOffset: number;
  /** Whether a drag is currently in progress. */
  isDragging: boolean;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function nearest(value: number, candidates: number[]): number {
  return candidates.reduce(
    (best, c) => (Math.abs(c - value) < Math.abs(best - value) ? c : best),
    candidates[0],
  );
}

/**
 * Drag + snap machinery for the bottom sheet. Returns props to spread on the
 * grab handle and the sliding surface, plus live drag state. A slow drag
 * settles to the nearest detent; a fast downward flick dismisses; a fast
 * upward flick expands to the tallest detent.
 *
 * @example
 * ```
 * const {contentProps, handleProps} = useSheetGestures({
 *   isOpen,
 *   onDismiss: () => onOpenChange(false),
 *   snapHeights: () => [240, 0.5 * (window.visualViewport?.height ?? 0)],
 * });
 * <div {...contentProps}>
 *   <div {...handleProps} />
 *   {children}
 * </div>
 * ```
 */
export function useSheetGestures({
  isOpen,
  onDismiss,
  snapHeights,
  onSnap,
  onDragProgress,
}: UseSheetGesturesOptions): UseSheetGesturesResult {
  const [dragOffset, setDragOffset] = useState(0);
  const [settledOffset, setSettledOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Latest callback refs so pointer handlers stay stable across renders.
  const onDismissRef = useRef(onDismiss);
  const onSnapRef = useRef(onSnap);
  const onDragProgressRef = useRef(onDragProgress);
  const snapHeightsRef = useRef(snapHeights);
  useEffect(() => {
    onDismissRef.current = onDismiss;
    onSnapRef.current = onSnap;
    onDragProgressRef.current = onDragProgress;
    snapHeightsRef.current = snapHeights;
  });

  // Live drag bookkeeping (refs so pointermove doesn't churn renders).
  const dragStateRef = useRef<{
    pointerId: number;
    startCoord: number;
    lastCoord: number;
    lastTime: number;
    velocity: number;
    height: number;
    baseOffset: number;
  } | null>(null);

  // Reset to the tallest detent each time the sheet re-opens.
  useEffect(() => {
    if (isOpen) {
      setDragOffset(0);
      setSettledOffset(0);
      setIsDragging(false);
    }
  }, [isOpen]);

  const measureHeight = useCallback((el: HTMLElement | null): number => {
    const sheet = el?.closest<HTMLElement>('[data-astryx-sheet]') ?? el;
    return sheet?.getBoundingClientRect().height ?? 0;
  }, []);

  // Detent translate offsets (px) from the tallest detent, ascending. The
  // tallest detent is offset 0; shorter detents translate further down.
  // Snap heights are resolved lazily here (at drag start) so they reflect the
  // current viewport without a persistent listener.
  const detentOffsets = useCallback((height: number): number[] => {
    const heights = (snapHeightsRef.current?.() ?? []).filter(
      h => h > 0 && h < height,
    );
    const offsets = heights.map(h => height - h);
    return [0, ...offsets].sort((a, b) => a - b);
  }, []);

  const settleFromDrag = useCallback(
    (
      offset: number,
      velocity: number,
      height: number,
      dir: number,
      travel: number,
      baseOffset: number,
    ) => {
      const offsets = detentOffsets(height);
      const maxOffset = offsets[offsets.length - 1];
      const shortestDetentHeight = height - maxOffset;
      const speed = Math.abs(velocity);
      const isFlick = speed > FLICK_VELOCITY && travel > FLICK_MIN_DISTANCE;

      // Fast downward flick = swipe-to-close, regardless of position.
      if (dir > 0 && isFlick) {
        onDismissRef.current();
        return;
      }
      // Fast upward flick = expand to the tallest detent (the sheet's full
      // provided height).
      if (dir < 0 && isFlick) {
        setSettledOffset(0);
        onSnapRef.current?.(height);
        hapticTick();
        return;
      }
      // Slow drag dragged well past the shortest detent = dismiss.
      if (offset > maxOffset + shortestDetentHeight * DISMISS_OVERSHOOT_RATIO) {
        onDismissRef.current();
        return;
      }
      // Settle to the nearest detent, but never past the starting detent in
      // the direction of the drag. Otherwise, on a sheet whose detents are far
      // apart, a downward drag that doesn't quite reach the halfway point
      // would snap back UP to where it started — reading as "it ignored my
      // swipe". Restricting the candidates to detents at/below (drag down) or
      // at/above (drag up) the start makes any committed drag move at least to
      // the next detent that way.
      let candidates = offsets;
      if (dir > 0) {
        const downward = offsets.filter(o => o >= baseOffset);
        if (downward.length > 0) {
          candidates = downward;
        }
      } else if (dir < 0) {
        const upward = offsets.filter(o => o <= baseOffset);
        if (upward.length > 0) {
          candidates = upward;
        }
      }
      const target = nearest(offset, candidates);
      setSettledOffset(target);
      onSnapRef.current?.(height - target);
      // Haptic "tick" when landing on a different detent (where supported).
      if (target !== baseOffset) {
        hapticTick();
      }
    },
    [detentOffsets],
  );

  const beginDrag = useCallback(
    (event: ReactPointerEvent, sheetHeight: number, startCoord?: number) => {
      const target = event.currentTarget as HTMLElement;
      target.setPointerCapture?.(event.pointerId);
      // `startCoord` lets a body-overscroll drag anchor at the original
      // pointer-down position (not the promotion point), so the first frame's
      // delta reflects the full pull distance.
      const start = startCoord ?? event.clientY;
      dragStateRef.current = {
        pointerId: event.pointerId,
        startCoord: start,
        lastCoord: event.clientY,
        lastTime: event.timeStamp,
        velocity: 0,
        height: sheetHeight,
        baseOffset: settledOffset,
      };
      // Seed the live drag offset at the current resting detent so the switch
      // from `settledOffset` to `dragOffset` (when isDragging flips true) is a
      // no-op. Without this the sheet jumps to the tallest detent for one
      // frame before the first pointermove corrects it.
      setDragOffset(settledOffset);
      setIsDragging(true);
    },
    [settledOffset],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent) => {
      beginDrag(event, measureHeight(event.currentTarget as HTMLElement));
    },
    [beginDrag, measureHeight],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent) => {
      const state = dragStateRef.current;
      if (!state || state.pointerId !== event.pointerId) {
        return;
      }
      const delta = event.clientY - state.startCoord;
      const dt = event.timeStamp - state.lastTime;
      if (dt > 0) {
        state.velocity = (event.clientY - state.lastCoord) / dt;
        state.lastCoord = event.clientY;
        state.lastTime = event.timeStamp;
      }
      const offsets = detentOffsets(state.height);

      // Raw offset from the tallest detent: base (resting detent) + this drag.
      const raw = state.baseOffset + delta;
      let next: number;
      if (raw < 0) {
        // Dragging past the top: allow it, but with rubber-band resistance so
        // the surface feels tethered. It springs back to the top on release.
        next = raw * OVERSCROLL_RESISTANCE;
      } else {
        // Magnetically ease toward a nearby detent so the sheet "clicks" into
        // place instead of hovering just off the mark.
        next = magnetize(raw, offsets);
      }
      setDragOffset(next);

      // Report how far into the "close zone" the drag is (0 above the shortest
      // detent, ramping to 1 at the dismiss threshold) so the owner can fade
      // the scrim as a visual hint that releasing here will close the sheet.
      const floorOffset = offsets[offsets.length - 1];
      const shortestDetentHeight = state.height - floorOffset;
      const dismissAt =
        floorOffset + shortestDetentHeight * DISMISS_OVERSHOOT_RATIO;
      const zone = dismissAt - floorOffset;
      const progress = zone > 0 ? (next - floorOffset) / zone : 0;
      onDragProgressRef.current?.(Math.min(1, Math.max(0, progress)));
    },
    [detentOffsets],
  );

  const endDrag = useCallback(
    (event: ReactPointerEvent) => {
      const state = dragStateRef.current;
      if (!state || state.pointerId !== event.pointerId) {
        return;
      }
      const target = event.currentTarget as HTMLElement;
      target.releasePointerCapture?.(event.pointerId);
      const delta = event.clientY - state.startCoord;
      const offset = Math.max(0, state.baseOffset + delta);
      const dir = delta === 0 ? 0 : delta > 0 ? 1 : -1;
      dragStateRef.current = null;
      setIsDragging(false);
      // Clear the close-zone hint; if we don't dismiss, the scrim restores.
      onDragProgressRef.current?.(0);
      settleFromDrag(
        offset,
        state.velocity,
        state.height || 1,
        dir,
        Math.abs(delta),
        state.baseOffset,
      );
    },
    [settleFromDrag],
  );

  // Body pull-down: when the scrollable content is at the very top, a
  // downward pull "overscrolls" into a sheet drag — a larger, more forgiving
  // drag target than the handle alone. Armed on pointer-down (only at the
  // scroll top); the first downward move promotes it to a real drag, while an
  // upward move (or any move when not at the top) leaves native scrolling
  // untouched.
  const armedBodyRef = useRef<{
    pointerId: number;
    startCoord: number;
    scroller: HTMLElement;
  } | null>(null);

  const handleBodyPointerDown = useCallback((event: ReactPointerEvent) => {
    const scroller = event.currentTarget as HTMLElement;
    if (scroller.scrollTop > 0) {
      armedBodyRef.current = null;
      return;
    }
    armedBodyRef.current = {
      pointerId: event.pointerId,
      startCoord: event.clientY,
      scroller,
    };
  }, []);

  const handleBodyPointerMove = useCallback(
    (event: ReactPointerEvent) => {
      // Already dragging the sheet (promoted from the body) — keep translating.
      if (dragStateRef.current) {
        handlePointerMove(event);
        return;
      }
      const armed = armedBodyRef.current;
      if (!armed || armed.pointerId !== event.pointerId) {
        return;
      }
      const delta = event.clientY - armed.startCoord;
      if (delta > 0 && armed.scroller.scrollTop <= 0) {
        // Downward pull at the top: promote to a sheet drag, anchored at the
        // original pointer-down position so the pull distance carries over.
        const sheetEl =
          armed.scroller.closest<HTMLElement>('[data-astryx-sheet]') ??
          armed.scroller;
        armedBodyRef.current = null;
        beginDrag(
          event,
          sheetEl.getBoundingClientRect().height || 0,
          armed.startCoord,
        );
        handlePointerMove(event);
      } else if (delta < 0) {
        // Upward move = the user is scrolling; disarm so we don't hijack it.
        armedBodyRef.current = null;
      }
    },
    [beginDrag, handlePointerMove],
  );

  const handleBodyEnd = useCallback(
    (event: ReactPointerEvent) => {
      armedBodyRef.current = null;
      if (dragStateRef.current) {
        endDrag(event);
      }
    },
    [endDrag],
  );

  const reducedMotion = useMemo(prefersReducedMotion, [isOpen]);

  // While dragging, follow the finger; otherwise rest at the settled detent.
  const activeOffset = isDragging ? dragOffset : settledOffset;

  const contentProps = useMemo<SheetContentProps>(
    () => ({
      style: {
        transform:
          activeOffset !== 0 ? `translateY(${activeOffset}px)` : undefined,
        transition: isDragging || reducedMotion ? 'none' : undefined,
        touchAction: 'none',
        overscrollBehavior: 'contain',
      },
    }),
    [activeOffset, isDragging, reducedMotion],
  );

  const handleProps = useMemo<SheetHandleProps>(
    () => ({
      style: {touchAction: 'none', cursor: 'grab'},
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    }),
    [handlePointerDown, handlePointerMove, endDrag],
  );

  const bodyProps = useMemo<SheetBodyProps>(
    () => ({
      onPointerDown: handleBodyPointerDown,
      onPointerMove: handleBodyPointerMove,
      onPointerUp: handleBodyEnd,
      onPointerCancel: handleBodyEnd,
    }),
    [handleBodyPointerDown, handleBodyPointerMove, handleBodyEnd],
  );

  return {
    contentProps,
    handleProps,
    bodyProps,
    dragOffset,
    settledOffset,
    isDragging,
  };
}
