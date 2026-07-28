// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSheetGestures.ts
 * @input Uses React (useCallback, useEffect, useRef, useState)
 * @output Exports useSheetGestures hook and its option/result types
 * @position Lab hook; consumed by BottomSheet and any surface that wants
 *   drag-to-dismiss / snap-point behavior on a sliding sheet
 *
 * Component-agnostic drag machinery for edge-anchored sheets. It tracks a
 * pointer drag along the block axis, translates the sliding surface live,
 * and on release either dismisses (past a distance/velocity threshold) or
 * settles to the nearest snap point. Pointer-events based so it covers both
 * mouse and touch with one code path.
 *
 * a11y: the grab handle is a real focusable element (`role="separator"`,
 * labeled, `tabIndex={0}`) and exposes keyboard handlers — Arrow keys move
 * between snap points, Escape delegates to the caller's dismiss (the sheet's
 * <dialog> already routes Escape to onDismiss, so swipe-to-dismiss always
 * has a keyboard equivalent).
 *
 * SSR-safe: no window/document access at module scope; all measurement
 * happens inside handlers/effects. Respects prefers-reduced-motion by
 * skipping the settle transition.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/hooks/useSheetGestures.doc.mjs
 * - /packages/lab/src/hooks/useSheetGestures.test.ts
 * - /packages/lab/src/hooks/index.ts (exports if types change)
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

// Fraction of the measured sheet height a drag must cross (with low
// velocity) before release dismisses instead of springing back.
const DISMISS_DISTANCE_RATIO = 0.25;
// A quick flick past this speed (px/ms) dismisses regardless of distance.
const DISMISS_VELOCITY = 0.5;

export type SheetAxis = 'bottom' | 'top';

export interface UseSheetGesturesOptions {
  /** Whether the owning sheet is open. Drag state resets when it closes. */
  isOpen: boolean;
  /** Called when a drag crosses the dismiss threshold (distance or flick). */
  onDismiss: () => void;
  /**
   * Detents the sheet can settle to, ordered from most-collapsed to
   * most-expanded. A number in (0, 1] is a fraction of the sheet's height
   * budget; any other number is a pixel height; a string is any CSS length
   * resolved against the measured sheet height. Omit for a single-height
   * sheet that only supports dismiss.
   */
  snapPoints?: Array<number | string>;
  /** Controlled active detent index. Pair with onSnapChange. */
  snapIndex?: number;
  /** Called when the active detent changes (drag settle or keyboard nav). */
  onSnapChange?: (index: number) => void;
  /** Disable all drag wiring (returns inert props). @default true */
  enabled?: boolean;
  /** Which edge the sheet is anchored to. @default 'bottom' */
  axis?: SheetAxis;
}

export interface SheetContentProps {
  style: CSSProperties;
}

export interface SheetHandleProps {
  role: 'separator';
  tabIndex: 0;
  'aria-label': string;
  'aria-orientation': 'horizontal';
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
  'aria-valuenow'?: number;
  style: CSSProperties;
  onPointerDown?: (event: ReactPointerEvent) => void;
  onPointerMove?: (event: ReactPointerEvent) => void;
  onPointerUp?: (event: ReactPointerEvent) => void;
  onPointerCancel?: (event: ReactPointerEvent) => void;
  onKeyDown?: (event: ReactKeyboardEvent) => void;
}

export interface UseSheetGesturesResult {
  /** Spread on the sliding surface: live translate + touch-action guard. */
  contentProps: SheetContentProps;
  /** Spread on the grab-handle element: a11y + pointer/keyboard handlers. */
  handleProps: SheetHandleProps;
  /** Current live drag offset in px (positive = dragged toward the edge). */
  dragOffset: number;
  /** Active detent index (0 when snapPoints is omitted). */
  activeSnapIndex: number;
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
 * Resolve a snap point spec to a pixel offset *from the fully-open
 * position* (0 = fully open, positive = collapsed toward the anchored edge).
 * Fractions are read as "visible fraction of the sheet", so 1 is fully open
 * (offset 0) and 0.5 shows half (offset = height/2).
 */
function resolveSnapOffset(spec: number | string, height: number): number {
  if (typeof spec === 'number') {
    if (spec > 0 && spec <= 1) {
      return height * (1 - spec);
    }
    return Math.max(0, height - spec);
  }
  const trimmed = spec.trim();
  if (trimmed.endsWith('%')) {
    const pct = parseFloat(trimmed) / 100;
    return height * (1 - pct);
  }
  const px = parseFloat(trimmed);
  return Number.isFinite(px) ? Math.max(0, height - px) : 0;
}

/**
 * Drag-to-dismiss and snap-point machinery for a sliding sheet. Returns
 * props to spread on the grab handle and the sliding surface, plus live
 * drag state for callers that want to drive their own animation.
 *
 * @example
 * ```
 * const {contentProps, handleProps} = useSheetGestures({
 *   isOpen,
 *   onDismiss: onClose,
 *   snapPoints: [0.4, 1],
 * });
 * <dialog {...contentProps}>
 *   <div {...handleProps} />
 *   {children}
 * </dialog>
 * ```
 */
export function useSheetGestures({
  isOpen,
  onDismiss,
  snapPoints,
  snapIndex,
  onSnapChange,
  enabled = true,
  axis = 'bottom',
}: UseSheetGesturesOptions): UseSheetGesturesResult {
  const isControlled = snapIndex != null;
  const detentCount = snapPoints?.length ?? 1;
  const openIndex = detentCount - 1;

  const [uncontrolledIndex, setUncontrolledIndex] = useState(openIndex);
  const activeSnapIndex = Math.min(
    isControlled ? snapIndex : uncontrolledIndex,
    openIndex,
  );

  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Latest callback refs so pointer handlers stay stable across renders.
  const onDismissRef = useRef(onDismiss);
  const onSnapChangeRef = useRef(onSnapChange);
  useEffect(() => {
    onDismissRef.current = onDismiss;
    onSnapChangeRef.current = onSnapChange;
  });

  // Live drag bookkeeping (refs so pointermove doesn't re-render churn).
  const dragStateRef = useRef<{
    pointerId: number;
    startCoord: number;
    startOffset: number;
    lastCoord: number;
    lastTime: number;
    velocity: number;
    height: number;
  } | null>(null);

  // Reset the active detent to fully-open each time the sheet re-opens.
  useEffect(() => {
    if (isOpen) {
      if (!isControlled) {
        setUncontrolledIndex(openIndex);
      }
      setDragOffset(0);
      setIsDragging(false);
    }
  }, [isOpen, isControlled, openIndex]);

  const commitSnapIndex = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(next, openIndex));
      if (!isControlled) {
        setUncontrolledIndex(clamped);
      }
      onSnapChangeRef.current?.(clamped);
    },
    [isControlled, openIndex],
  );

  const measureHeight = useCallback((el: HTMLElement | null): number => {
    const sheet = el?.closest<HTMLElement>('[data-astryx-sheet]') ?? el;
    return sheet?.getBoundingClientRect().height ?? 0;
  }, []);

  const settleFromDrag = useCallback(
    (offset: number, velocity: number, height: number) => {
      const dismiss =
        offset > height * DISMISS_DISTANCE_RATIO || velocity > DISMISS_VELOCITY;
      if (dismiss && (activeSnapIndex === 0 || !snapPoints)) {
        onDismissRef.current();
        return;
      }

      if (!snapPoints || snapPoints.length === 0) {
        // No detents: below threshold springs back to fully open.
        setDragOffset(0);
        return;
      }

      // The drag offset is measured from the currently active detent's
      // resting offset; translate to an absolute offset, then snap to the
      // nearest detent. Dragging past the most-collapsed detent dismisses.
      const baseOffset = resolveSnapOffset(
        snapPoints[activeSnapIndex],
        height,
      );
      const absolute = baseOffset + offset;

      if (dismiss && absolute > resolveSnapOffset(snapPoints[0], height)) {
        onDismissRef.current();
        return;
      }

      let nearest = 0;
      let nearestDist = Infinity;
      for (let i = 0; i < snapPoints.length; i++) {
        const dist = Math.abs(resolveSnapOffset(snapPoints[i], height) - absolute);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = i;
        }
      }
      setDragOffset(0);
      if (nearest !== activeSnapIndex) {
        commitSnapIndex(nearest);
      }
    },
    [activeSnapIndex, snapPoints, commitSnapIndex],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent) => {
      if (!enabled) {
        return;
      }
      const target = event.currentTarget as HTMLElement;
      target.setPointerCapture?.(event.pointerId);
      dragStateRef.current = {
        pointerId: event.pointerId,
        startCoord: event.clientY,
        startOffset: 0,
        lastCoord: event.clientY,
        lastTime: event.timeStamp,
        velocity: 0,
        height: measureHeight(target),
      };
      setIsDragging(true);
    },
    [enabled, measureHeight],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent) => {
      const state = dragStateRef.current;
      if (!state || state.pointerId !== event.pointerId) {
        return;
      }
      // For a bottom sheet, dragging DOWN (increasing Y) collapses/dismisses;
      // for a top sheet the sign flips. Only allow drag in the closing
      // direction past the fully-open position (no rubber-band overscroll).
      const delta = event.clientY - state.startCoord;
      const directional = axis === 'bottom' ? delta : -delta;
      const dt = event.timeStamp - state.lastTime;
      if (dt > 0) {
        const coordDelta =
          (axis === 'bottom' ? 1 : -1) * (event.clientY - state.lastCoord);
        state.velocity = coordDelta / dt;
        state.lastCoord = event.clientY;
        state.lastTime = event.timeStamp;
      }
      setDragOffset(Math.max(0, directional));
    },
    [axis],
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
      const directional = Math.max(0, axis === 'bottom' ? delta : -delta);
      dragStateRef.current = null;
      setIsDragging(false);
      settleFromDrag(directional, state.velocity, state.height || 1);
    },
    [axis, settleFromDrag],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent) => {
      if (!enabled) {
        return;
      }
      // Arrow keys move between detents (a keyboard equivalent for the
      // drag). expand = toward fully-open (higher index), collapse = toward
      // the anchored edge (lower index). Escape is handled by the sheet's
      // dialog, which routes to onDismiss.
      const expandKey = axis === 'bottom' ? 'ArrowUp' : 'ArrowDown';
      const collapseKey = axis === 'bottom' ? 'ArrowDown' : 'ArrowUp';
      if (!snapPoints || snapPoints.length < 2) {
        return;
      }
      if (event.key === expandKey) {
        event.preventDefault();
        commitSnapIndex(activeSnapIndex + 1);
      } else if (event.key === collapseKey) {
        event.preventDefault();
        commitSnapIndex(activeSnapIndex - 1);
      }
    },
    [enabled, axis, snapPoints, activeSnapIndex, commitSnapIndex],
  );

  // The resting offset for the active detent is expressed as a CSS transform
  // so the sheet can rest partway open; the live drag adds to it. Reduced
  // motion skips the settle transition (snaps instantly).
  const reducedMotion = useMemo(prefersReducedMotion, [isOpen]);

  const contentProps = useMemo<SheetContentProps>(() => {
    if (!enabled) {
      return {style: {}};
    }
    const sign = axis === 'bottom' ? 1 : -1;
    // Resting fraction: we can't measure height at render for the CSS var,
    // so partial detents are expressed via translate percentages. dragOffset
    // is a live px add-on during the gesture.
    const restPercent =
      snapPoints && snapPoints.length > 0
        ? restTranslatePercent(snapPoints[activeSnapIndex])
        : 0;
    const translate = `translateY(calc(${sign * restPercent}% + ${
      sign * dragOffset
    }px))`;
    return {
      style: {
        transform: dragOffset !== 0 || restPercent !== 0 ? translate : undefined,
        transition: isDragging || reducedMotion ? 'none' : undefined,
        touchAction: 'none',
        overscrollBehavior: 'contain',
      },
    };
  }, [
    enabled,
    axis,
    snapPoints,
    activeSnapIndex,
    dragOffset,
    isDragging,
    reducedMotion,
  ]);

  const handleProps = useMemo<SheetHandleProps>(() => {
    const base: SheetHandleProps = {
      role: 'separator',
      tabIndex: 0,
      'aria-label': 'Drag to resize or dismiss',
      'aria-orientation': 'horizontal',
      style: {touchAction: 'none', cursor: enabled ? 'grab' : 'default'},
    };
    if (!enabled) {
      return base;
    }
    if (snapPoints && snapPoints.length > 1) {
      base['aria-valuemin'] = 0;
      base['aria-valuemax'] = snapPoints.length - 1;
      base['aria-valuenow'] = activeSnapIndex;
    }
    return {
      ...base,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onKeyDown: handleKeyDown,
    };
  }, [
    enabled,
    snapPoints,
    activeSnapIndex,
    handlePointerDown,
    handlePointerMove,
    endDrag,
    handleKeyDown,
  ]);

  return {
    contentProps,
    handleProps,
    dragOffset,
    activeSnapIndex,
    isDragging,
  };
}

/**
 * Resting translate as a percentage of the sheet height for a detent spec.
 * Fractions map directly (0.5 -> 50% collapsed); px/length specs can't be
 * resolved without a measured height at render, so they rest fully open and
 * rely on the runtime drag settle for their exact offset.
 */
function restTranslatePercent(spec: number | string): number {
  if (typeof spec === 'number' && spec > 0 && spec <= 1) {
    return (1 - spec) * 100;
  }
  if (typeof spec === 'string' && spec.trim().endsWith('%')) {
    const pct = parseFloat(spec) / 100;
    return (1 - pct) * 100;
  }
  return 0;
}
