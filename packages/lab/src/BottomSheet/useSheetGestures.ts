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
import {
  computeDetentOffsets,
  resolveSettleOffset,
  scrimOpacityForOffset,
} from './snapOffsets';

// A flick (fast throw) dismisses (down) or expands (up) regardless of where
// it ends. Requires both a speed and a distance floor so a small nudge
// doesn't trigger it.
const FLICK_VELOCITY = 1.2; // px/ms
const FLICK_MIN_DISTANCE = 48; // px traveled during the gesture
// On a slow drag below the shortest detent, dismiss once dragged past it by
// more than this fraction of that detent's height; otherwise snap back to it.
const DISMISS_OVERSHOOT_RATIO = 0.4;
// Within this many px of a detent, the live drag is magnetically eased toward
// it so it "clicks" into place instead of hovering just off the mark.
const MAGNET_RANGE = 40;
// Rubber-band factor for dragging up past fully-open, capped at OVERSCROLL_MAX
// (the sheet reserves that much bottom padding for the lift to reveal).
const OVERSCROLL_RESISTANCE = 0.35;
// SYNC: must match OVERSCROLL_PADDING in BottomSheet.tsx (the reserved bottom
// padding the lift reveals). Kept as a local const rather than a shared import
// so it can be used inside stylex.create there.
const OVERSCROLL_MAX = 48;

// Short haptic tick on detent settle where supported. iOS Safari doesn't
// expose navigator.vibrate, so this is a no-op there; skipped under
// reduced-motion.
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
   * Called with the scrim opacity the sheet should show (1 = fully visible,
   * 0 = hidden) as the drag moves and on settle. Full while the sheet is at
   * or above its mid detent, fading to 0 as it collapses onto the shortest
   * "peek" detent — thinning to a faint glance state without fully clearing — and
   * on the dismiss overshoot. Lets the owner mirror it onto the scrim.
   */
  onScrimOpacity?: (opacity: number) => void;
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
  ref: (node: HTMLElement | null) => void;
  onPointerDown: (event: ReactPointerEvent) => void;
  onPointerMove: (event: ReactPointerEvent) => void;
  onPointerUp: (event: ReactPointerEvent) => void;
  onPointerCancel: (event: ReactPointerEvent) => void;
}

export interface UseSheetGesturesResult {
  /**
   * Callback ref for the sheet surface. The hook observes it (ResizeObserver)
   * to keep the fully-open height current, so detents stay correct across
   * rotation / viewport changes without re-measuring mid-drag.
   */
  sheetRef: (node: HTMLElement | null) => void;
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
  onScrimOpacity,
}: UseSheetGesturesOptions): UseSheetGesturesResult {
  const [dragOffset, setDragOffset] = useState(0);
  const [settledOffset, setSettledOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const onDismissRef = useRef(onDismiss);
  const onSnapRef = useRef(onSnap);
  const onScrimOpacityRef = useRef(onScrimOpacity);
  const snapHeightsRef = useRef(snapHeights);
  useEffect(() => {
    onDismissRef.current = onDismiss;
    onSnapRef.current = onSnap;
    onScrimOpacityRef.current = onScrimOpacity;
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

  // Fully-open height, tracked by a ResizeObserver (see sheetRef) so detents
  // stay correct across rotation / viewport changes without re-measuring.
  const sheetHeightRef = useRef(0);
  const sheetElRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const sheetRef = useCallback((node: HTMLElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    sheetElRef.current = node;
    if (!node || typeof ResizeObserver === 'undefined') {
      if (node) {
        sheetHeightRef.current = node.getBoundingClientRect().height;
      }
      return;
    }
    sheetHeightRef.current = node.getBoundingClientRect().height;
    const ro = new ResizeObserver(entries => {
      const box = entries[0]?.contentRect;
      if (box && box.height > 0) {
        sheetHeightRef.current = box.height;
      }
    });
    ro.observe(node);
    observerRef.current = ro;
  }, []);
  useEffect(() => () => observerRef.current?.disconnect(), []);

  // Reset to the tallest detent each time the sheet re-opens.
  useEffect(() => {
    if (isOpen) {
      setDragOffset(0);
      setSettledOffset(0);
      setIsDragging(false);
    }
  }, [isOpen]);

  // The fully-open height for detent math. Prefer the ResizeObserver-locked
  // value; fall back to a live measure of the tracked sheet element if the
  // observer hasn't reported yet.
  const measureHeight = useCallback((): number => {
    if (sheetHeightRef.current > 0) {
      return sheetHeightRef.current;
    }
    return sheetElRef.current?.getBoundingClientRect().height ?? 0;
  }, []);

  // Detent translate offsets (px) from the tallest detent, ascending. The
  // tallest detent is offset 0; shorter detents translate further down.
  // Snap heights are resolved lazily here (at drag start) so they reflect the
  // current viewport without a persistent listener.
  const detentOffsets = useCallback((height: number): number[] => {
    return computeDetentOffsets(height, snapHeightsRef.current?.() ?? []);
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

      if (dir > 0 && isFlick) {
        onDismissRef.current();
        return;
      }
      // Fast upward flick = expand to the tallest detent (the sheet's full
      // provided height).
      if (dir < 0 && isFlick) {
        setSettledOffset(0);
        onSnapRef.current?.(height);
        onScrimOpacityRef.current?.(1);
        hapticTick();
        return;
      }
      if (offset > maxOffset + shortestDetentHeight * DISMISS_OVERSHOOT_RATIO) {
        onDismissRef.current();
        return;
      }
      // Settle to the nearest detent in the drag direction (never back past
      // the starting detent), de-duped and direction-clamped by the util.
      const target = resolveSettleOffset(offset, offsets, dir, baseOffset);
      setSettledOffset(target);
      onSnapRef.current?.(height - target);
      // Keep the scrim in sync with the resting detent (faint floor at the peek).
      const dismissOffset =
        maxOffset + shortestDetentHeight * DISMISS_OVERSHOOT_RATIO;
      onScrimOpacityRef.current?.(
        scrimOpacityForOffset(target, offsets, dismissOffset),
      );
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
      // Seed dragOffset at the resting detent so flipping isDragging doesn't
      // jump the sheet to fully-open for one frame.
      setDragOffset(settledOffset);
      setIsDragging(true);
    },
    [settledOffset],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent) => {
      beginDrag(event, measureHeight());
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

      const raw = state.baseOffset + delta;
      const maxDetentOffset = offsets[offsets.length - 1];
      let next: number;
      if (raw < 0) {
        // Up past fully-open: damped + capped rubber-band; springs back on release.
        next = Math.max(-OVERSCROLL_MAX, raw * OVERSCROLL_RESISTANCE);
      } else if (raw > maxDetentOffset) {
        // In the dismiss zone: no magnet, so it doesn't fight a drag-to-close.
        next = raw;
      } else {
        // Between detents: magnetically ease toward a nearby one.
        next = magnetize(raw, offsets);
      }
      setDragOffset(next);

      // Mirror the scrim to the live drag: full at/above the mid detent,
      // fading to hidden as it collapses onto the peek detent and through the
      // dismiss overshoot.
      const floorOffset = offsets[offsets.length - 1];
      const shortestDetentHeight = state.height - floorOffset;
      const dismissOffset =
        floorOffset + shortestDetentHeight * DISMISS_OVERSHOOT_RATIO;
      onScrimOpacityRef.current?.(
        scrimOpacityForOffset(next, offsets, dismissOffset),
      );
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

  // Pointer path for the body at-top pull-down (desktop / mouse). Touch uses
  // the non-passive listener below, since pointer events are cancelled once a
  // native pan starts.
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
        armedBodyRef.current = null;
        beginDrag(event, measureHeight(), armed.startCoord);
        handlePointerMove(event);
      } else if (delta < 0) {
        // Upward move = the user is scrolling; disarm so we don't hijack it.
        armedBodyRef.current = null;
      }
    },
    [beginDrag, handlePointerMove, measureHeight],
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

  // Non-passive touchmove is the reliable scroll<->drag handoff on touch:
  // preventDefault() at a scroll edge stops the native scroll and drives the
  // sheet drag through the pointer math (Touch adapted to the fields it reads).
  const bodyNodeRef = useRef<HTMLElement | null>(null);
  const touchDragRef = useRef<{
    id: number;
    startY: number;
    top: boolean;
    bottom: boolean;
  } | null>(null);
  const prevTouchHandlers = useRef<{
    start: (e: TouchEvent) => void;
    move: (e: TouchEvent) => void;
    end: (e: TouchEvent) => void;
  } | null>(null);

  const beginDragRef = useRef(beginDrag);
  const pointerMoveRef = useRef(handlePointerMove);
  const endDragRef = useRef(endDrag);
  const measureHeightRef = useRef(measureHeight);
  useEffect(() => {
    beginDragRef.current = beginDrag;
    pointerMoveRef.current = handlePointerMove;
    endDragRef.current = endDrag;
    measureHeightRef.current = measureHeight;
  });

  const bodyRef = useCallback((node: HTMLElement | null) => {
    const asPointer = (touch: Touch, target: HTMLElement) =>
      ({
        pointerId: touch.identifier,
        clientY: touch.clientY,
        timeStamp: Date.now(),
        currentTarget: target,
        setPointerCapture: () => {},
        releasePointerCapture: () => {},
      }) as unknown as ReactPointerEvent;

    const atTop = (el: HTMLElement) => el.scrollTop <= 0;
    const atBottom = (el: HTMLElement) =>
      el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

    const onTouchStart = (event: TouchEvent) => {
      const scroller = event.currentTarget as HTMLElement;
      const touch = event.changedTouches[0];
      // Arm only at a scroll edge; from mid-content this is an ordinary scroll.
      // At the top, a pull DOWN hands off (collapse); at the bottom, a pull UP
      // hands off (expand). Record the edge so the move handler matches it.
      if (!touch) {
        touchDragRef.current = null;
        return;
      }
      const top = atTop(scroller);
      const bottom = atBottom(scroller);
      if (!top && !bottom) {
        touchDragRef.current = null;
        return;
      }
      touchDragRef.current = {
        id: touch.identifier,
        startY: touch.clientY,
        top,
        bottom,
      };
    };

    const onTouchMove = (event: TouchEvent) => {
      const scroller = event.currentTarget as HTMLElement;
      if (dragStateRef.current) {
        const t = [...event.changedTouches].find(
          x => x.identifier === dragStateRef.current?.pointerId,
        );
        if (t) {
          event.preventDefault();
          pointerMoveRef.current(asPointer(t, scroller));
        }
        return;
      }
      const armed = touchDragRef.current;
      if (!armed) {
        return;
      }
      const t = [...event.changedTouches].find(x => x.identifier === armed.id);
      if (!t) {
        return;
      }
      const delta = t.clientY - armed.startY;
      // Promote to a sheet drag on a pull that opposes the armed edge and can
      // no longer scroll that way: at the top, a downward pull (delta > 0)
      // collapses; at the bottom, an upward pull (delta < 0) expands. The
      // opposite direction is a real scroll, so disarm and let it through.
      const pullDownAtTop = armed.top && delta > 0 && atTop(scroller);
      const pullUpAtBottom = armed.bottom && delta < 0 && atBottom(scroller);
      if (pullDownAtTop || pullUpAtBottom) {
        event.preventDefault();
        touchDragRef.current = null;
        beginDragRef.current(
          asPointer(t, scroller),
          measureHeightRef.current(),
          armed.startY,
        );
        pointerMoveRef.current(asPointer(t, scroller));
      } else if ((armed.top && delta < 0) || (armed.bottom && delta > 0)) {
        // Scrolling away from the armed edge; hand back to native scroll.
        touchDragRef.current = null;
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      touchDragRef.current = null;
      if (dragStateRef.current) {
        const t = event.changedTouches[0];
        if (t) {
          endDragRef.current(asPointer(t, event.currentTarget as HTMLElement));
        }
      }
    };

    const prev = bodyNodeRef.current;
    if (prev && prevTouchHandlers.current) {
      const h = prevTouchHandlers.current;
      prev.removeEventListener('touchstart', h.start);
      prev.removeEventListener('touchmove', h.move);
      prev.removeEventListener('touchend', h.end);
      prev.removeEventListener('touchcancel', h.end);
    }
    bodyNodeRef.current = node;
    if (node) {
      node.addEventListener('touchstart', onTouchStart, {passive: true});
      node.addEventListener('touchmove', onTouchMove, {passive: false});
      node.addEventListener('touchend', onTouchEnd, {passive: true});
      node.addEventListener('touchcancel', onTouchEnd, {passive: true});
      prevTouchHandlers.current = {
        start: onTouchStart,
        move: onTouchMove,
        end: onTouchEnd,
      };
    } else {
      prevTouchHandlers.current = null;
    }
  }, []);

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
      ref: bodyRef,
      onPointerDown: handleBodyPointerDown,
      onPointerMove: handleBodyPointerMove,
      onPointerUp: handleBodyEnd,
      onPointerCancel: handleBodyEnd,
    }),
    [bodyRef, handleBodyPointerDown, handleBodyPointerMove, handleBodyEnd],
  );

  return {
    sheetRef,
    contentProps,
    handleProps,
    bodyProps,
    dragOffset,
    settledOffset,
    isDragging,
  };
}
