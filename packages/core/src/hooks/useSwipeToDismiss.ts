// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSwipeToDismiss.ts
 * @input Uses React useRef, useCallback, useState
 * @output Exports useSwipeToDismiss hook for mobile swipe-to-dismiss gestures
 * @position Core hook; used by Sheet for optional swipe-down/up dismissal
 *
 * Detects single-finger swipe gestures along the swipe axis (vertical for
 * bottom/top sheets). Tracks velocity and displacement; fires onDismiss
 * when the displacement exceeds the dismiss threshold (default 40% of
 * container). Returns a drag handle ref and progress value for animated
 * follow-along.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 * - /packages/core/src/Sheet/Sheet.tsx (if the API shape changes)
 */

import {useCallback, useEffect, useRef, useState} from 'react';

// =============================================================================
// Types
// =============================================================================

export type SwipeDirection = 'down' | 'up' | 'start' | 'end';

export interface UseSwipeToDismissOptions {
  /** Called when the swipe crosses the dismiss threshold. */
  onDismiss: () => void;
  /** Direction the swipe should travel to dismiss. */
  direction: SwipeDirection;
  /** Whether the swipe gesture is enabled. */
  enabled?: boolean;
  /** Ratio of the container size that triggers dismissal (0-1). Default 0.4. */
  threshold?: number;
  /** Minimum velocity in px/ms to trigger a fast-dismiss. Default 0.4. */
  velocityThreshold?: number;
  /** Total transition duration in ms for the snap-back. Default 200. */
  animationDuration?: number;
}

export interface UseSwipeToDismissReturn {
  /** Ref to attach to the drag handle element (or the panel itself). */
  handleRef: React.RefObject<HTMLDivElement | null>;
  /** Whether a swipe gesture is actively in progress. */
  isSwiping: boolean;
  /** Current progress as a ratio (0 = closed/none, 1 = fully dismissed). */
  progress: number;
  /** Reset the swipe state (call after dismiss completes or is cancelled). */
  resetSwipe: () => void;
  /** Bind these to the panel for animated follow-along. */
  swipeStyle: React.CSSProperties;
}

// =============================================================================
// Hook
// =============================================================================

export function useSwipeToDismiss({
  onDismiss,
  direction,
  enabled = true,
  threshold = 0.4,
  velocityThreshold = 0.4,
  animationDuration = 200,
}: UseSwipeToDismissOptions): UseSwipeToDismissReturn {
  const handleRef = useRef<HTMLDivElement | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [progress, setProgress] = useState(0);

  const startRef = useRef<{x: number; y: number; _time: number} | null>(null);
  const currentRef = useRef<{x: number; y: number} | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const onDismissRef = useRef(onDismiss);
  const dismissedRef = useRef(false);

  onDismissRef.current = onDismiss;

  const resetSwipe = useCallback(() => {
    dismissedRef.current = false;
    setIsSwiping(false);
    setProgress(0);
    startRef.current = null;
    currentRef.current = null;
  }, []);

  // Determine which axis to track based on direction
  const isVertical = direction === 'down' || direction === 'up';
  const positiveDirection = direction === 'down' || direction === 'end';

  const getProgress = useCallback(
    (containerSize: number, delta: number) => {
      if (containerSize <= 0) {
        return 0;
      }
      const normalizedDelta = positiveDirection
        ? Math.max(0, delta)
        : Math.max(0, -delta);
      return Math.min(1, normalizedDelta / (containerSize * threshold));
    },
    [positiveDirection, threshold],
  );

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled || e.touches.length !== 1) {
        return;
      }
      const touch = e.touches[0];
      startRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        _time: e.timeStamp,
      };
      currentRef.current = {x: touch.clientX, y: touch.clientY};
      dismissedRef.current = false;
    },
    [enabled],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || dismissedRef.current || !startRef.current) {
        return;
      }
      // Don't prevent default unless we're actually swiping the handle
      const handle = handleRef.current;
      if (handle && !handle.contains(e.target as Node)) {
        return;
      }

      const touch = e.touches[0];
      currentRef.current = {x: touch.clientX, y: touch.clientY};

      const deltaX = currentRef.current.x - startRef.current.x;
      const deltaY = currentRef.current.y - startRef.current.y;
      const delta = isVertical ? deltaY : deltaX;

      // Check if the gesture is primarily in the expected direction
      if (isVertical && Math.abs(deltaX) > Math.abs(deltaY)) {
        return;
      }
      if (!isVertical && Math.abs(deltaY) > Math.abs(deltaX)) {
        return;
      }

      // Don't swipe in the opposite direction (e.g., pulling up on a bottom sheet)
      if (positiveDirection ? delta < 0 : delta > 0) {
        setProgress(0);
        return;
      }

      e.preventDefault();

      const container = handle?.parentElement;
      const containerSize = isVertical
        ? (container?.clientHeight ?? window.innerHeight)
        : (container?.clientWidth ?? window.innerWidth);

      const p = getProgress(containerSize, delta);
      setProgress(p);
      setIsSwiping(true);
    },
    [enabled, isVertical, positiveDirection, getProgress],
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (
        !enabled ||
        dismissedRef.current ||
        !startRef.current ||
        !currentRef.current
      ) {
        resetSwipe();
        return;
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startRef.current.x;
      const deltaY = touch.clientY - startRef.current.y;
      const delta = isVertical ? deltaY : deltaX;
      const dt = e.timeStamp - startRef.current._time;

      const velocity = dt > 0 ? Math.abs(delta) / dt : 0;

      const container = handleRef.current?.parentElement;
      const containerSize = isVertical
        ? (container?.clientHeight ?? window.innerHeight)
        : (container?.clientWidth ?? window.innerWidth);
      const progress = getProgress(containerSize, delta);

      if (progress >= 1 || velocity > velocityThreshold) {
        dismissedRef.current = true;
        onDismissRef.current();
        setProgress(0);
      } else {
        // Snap back
        setProgress(0);
      }

      setIsSwiping(false);
      startRef.current = null;
      currentRef.current = null;
    },
    [enabled, isVertical, getProgress, velocityThreshold, resetSwipe],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const handle = handleRef.current;
    if (!handle) {
      return;
    }

    const opts = {passive: false} as AddEventListenerOptions;
    handle.addEventListener('touchstart', handleTouchStart, opts);
    handle.addEventListener('touchmove', handleTouchMove, opts);
    handle.addEventListener('touchend', handleTouchEnd, opts);
    handle.addEventListener('touchcancel', resetSwipe, opts);

    return () => {
      handle.removeEventListener('touchstart', handleTouchStart, opts);
      handle.removeEventListener('touchmove', handleTouchMove, opts);
      handle.removeEventListener('touchend', handleTouchEnd, opts);
      handle.removeEventListener('touchcancel', resetSwipe, opts);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd, resetSwipe]);

  // Derive the CSS transform for visual follow-along
  const translateValue =
    progress > 0 ? `${positiveDirection ? '' : '-'}${progress * 100}%` : '0%';

  const swipeStyle: React.CSSProperties = {
    transition: isSwiping
      ? 'none'
      : `transform ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    transform: isVertical
      ? `translateY(${translateValue})`
      : `translateX(${translateValue})`,
    willChange: isSwiping ? 'transform' : undefined,
  };

  return {
    handleRef,
    isSwiping,
    progress,
    resetSwipe,
    swipeStyle,
  };
}
