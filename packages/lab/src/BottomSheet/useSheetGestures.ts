// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSheetGestures.ts
 * @input Uses React (useCallback, useEffect, useMemo, useRef, useState)
 * @output Exports useSheetGestures hook and its option/result types
 * @position Internal to BottomSheet; not exported from the lab entry point
 *
 * Drag-to-dismiss machinery for the bottom sheet. Tracks a pointer drag
 * down the block axis, translates the sliding surface live, and on release
 * either dismisses (past a distance or velocity threshold) or springs back
 * to fully open. Pointer-events based so one code path covers mouse + touch.
 *
 * Kept private to BottomSheet: the behavior is sheet-specific (a dismiss
 * edge on a bottom-anchored surface). It is not a general primitive and is
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

// Fraction of the measured sheet height a drag must cross (with low
// velocity) before release dismisses instead of springing back.
const DISMISS_DISTANCE_RATIO = 0.25;
// A quick flick past this speed (px/ms) dismisses regardless of distance.
const DISMISS_VELOCITY = 0.5;

export interface UseSheetGesturesOptions {
  /** Whether the owning sheet is open. Drag state resets when it closes. */
  isOpen: boolean;
  /** Called when a drag crosses the dismiss threshold (distance or flick). */
  onDismiss: () => void;
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

export interface UseSheetGesturesResult {
  /** Spread on the sliding surface: live translate + touch-action guard. */
  contentProps: SheetContentProps;
  /** Spread on the grab-handle element: pointer drag handlers. */
  handleProps: SheetHandleProps;
  /** Current live drag offset in px (positive = dragged toward the edge). */
  dragOffset: number;
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
 * Drag-to-dismiss machinery for the bottom sheet. Returns props to spread on
 * the grab handle and the sliding surface, plus live drag state for callers
 * that want to drive their own animation.
 *
 * @example
 * ```
 * const {contentProps, handleProps} = useSheetGestures({
 *   isOpen,
 *   onDismiss: () => onOpenChange(false),
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
}: UseSheetGesturesOptions): UseSheetGesturesResult {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Latest callback ref so pointer handlers stay stable across renders.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  // Live drag bookkeeping (refs so pointermove doesn't churn renders).
  const dragStateRef = useRef<{
    pointerId: number;
    startCoord: number;
    lastCoord: number;
    lastTime: number;
    velocity: number;
    height: number;
  } | null>(null);

  // Reset drag state each time the sheet re-opens.
  useEffect(() => {
    if (isOpen) {
      setDragOffset(0);
      setIsDragging(false);
    }
  }, [isOpen]);

  const measureHeight = useCallback((el: HTMLElement | null): number => {
    const sheet = el?.closest<HTMLElement>('[data-astryx-sheet]') ?? el;
    return sheet?.getBoundingClientRect().height ?? 0;
  }, []);

  const settleFromDrag = useCallback(
    (offset: number, velocity: number, height: number) => {
      const dismiss =
        offset > height * DISMISS_DISTANCE_RATIO || velocity > DISMISS_VELOCITY;
      if (dismiss) {
        onDismissRef.current();
        return;
      }
      // Below threshold: spring back to fully open.
      setDragOffset(0);
    },
    [],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent) => {
      const target = event.currentTarget as HTMLElement;
      target.setPointerCapture?.(event.pointerId);
      dragStateRef.current = {
        pointerId: event.pointerId,
        startCoord: event.clientY,
        lastCoord: event.clientY,
        lastTime: event.timeStamp,
        velocity: 0,
        height: measureHeight(target),
      };
      setIsDragging(true);
    },
    [measureHeight],
  );

  const handlePointerMove = useCallback((event: ReactPointerEvent) => {
    const state = dragStateRef.current;
    if (!state || state.pointerId !== event.pointerId) {
      return;
    }
    // Dragging DOWN (increasing Y) collapses/dismisses. Only allow drag in
    // the closing direction past the fully-open position (no overscroll).
    const delta = event.clientY - state.startCoord;
    const dt = event.timeStamp - state.lastTime;
    if (dt > 0) {
      state.velocity = (event.clientY - state.lastCoord) / dt;
      state.lastCoord = event.clientY;
      state.lastTime = event.timeStamp;
    }
    setDragOffset(Math.max(0, delta));
  }, []);

  const endDrag = useCallback(
    (event: ReactPointerEvent) => {
      const state = dragStateRef.current;
      if (!state || state.pointerId !== event.pointerId) {
        return;
      }
      const target = event.currentTarget as HTMLElement;
      target.releasePointerCapture?.(event.pointerId);
      const offset = Math.max(0, event.clientY - state.startCoord);
      dragStateRef.current = null;
      setIsDragging(false);
      settleFromDrag(offset, state.velocity, state.height || 1);
    },
    [settleFromDrag],
  );

  // Reduced motion skips the settle transition (snaps instantly).
  const reducedMotion = useMemo(prefersReducedMotion, [isOpen]);

  const contentProps = useMemo<SheetContentProps>(
    () => ({
      style: {
        transform: dragOffset !== 0 ? `translateY(${dragOffset}px)` : undefined,
        transition: isDragging || reducedMotion ? 'none' : undefined,
        touchAction: 'none',
        overscrollBehavior: 'contain',
      },
    }),
    [dragOffset, isDragging, reducedMotion],
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

  return {contentProps, handleProps, dragOffset, isDragging};
}
