// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useLongPress.ts
 * @input Long-press options: onLongPress callback, disabled, delayMs, moveCancelPx
 * @output Touch handlers to spread onto an element
 * @position Core hook for touch long-press invocation; used by ContextMenu
 *
 * SYNC: When modified, update the hooks barrel /packages/core/src/hooks/index.ts
 *
 * Detects a single-finger long-press: fires `onLongPress` with the touch
 * start point after `delayMs`. Cancels if the finger moves past
 * `moveCancelPx` (treated as a scroll/drag), lifts, or the touch is
 * cancelled. The pending timer is also cleared on unmount.
 *
 * Motivation: iOS Safari never synthesizes a `contextmenu` event on
 * long-press, so long-press is the only touch affordance for opening
 * cursor-positioned surfaces.
 */

import {useCallback, useEffect, useRef} from 'react';

// Default long-press tuning.
const DEFAULT_DELAY_MS = 500;
const DEFAULT_MOVE_CANCEL_PX = 10;

export interface UseLongPressOptions {
  /** Fired with the touch start point once the press is held for `delayMs`. */
  onLongPress: (point: {x: number; y: number}) => void;
  /** When true, touch handlers are inert. */
  disabled?: boolean;
  /** Hold duration before the press fires, in ms. Defaults to 500. */
  delayMs?: number;
  /** Movement past this distance (px, either axis) cancels the press. Defaults to 10. */
  moveCancelPx?: number;
}

export interface UseLongPressHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onTouchCancel: () => void;
}

export function useLongPress(
  options: UseLongPressOptions,
): UseLongPressHandlers {
  const {
    onLongPress,
    disabled = false,
    delayMs = DEFAULT_DELAY_MS,
    moveCancelPx = DEFAULT_MOVE_CANCEL_PX,
  } = options;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef<{x: number; y: number} | null>(null);
  // Keep the latest callback without re-creating handlers on every render.
  const onLongPressRef = useRef(onLongPress);
  onLongPressRef.current = onLongPress;

  const clear = useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startRef.current = null;
  }, []);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || e.touches.length !== 1) {
        return;
      }
      const touch = e.touches[0];
      // Clear any stale timer first, THEN record the start point — clearing
      // also nulls startRef, so order matters.
      clear();
      startRef.current = {x: touch.clientX, y: touch.clientY};
      timerRef.current = setTimeout(() => {
        const start = startRef.current;
        if (start == null) {
          return;
        }
        onLongPressRef.current({x: start.x, y: start.y});
      }, delayMs);
    },
    [disabled, delayMs, clear],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const start = startRef.current;
      if (start == null || e.touches.length !== 1) {
        return;
      }
      const touch = e.touches[0];
      if (
        Math.abs(touch.clientX - start.x) > moveCancelPx ||
        Math.abs(touch.clientY - start.y) > moveCancelPx
      ) {
        // Treat as a scroll/drag, not a long-press.
        clear();
      }
    },
    [moveCancelPx, clear],
  );

  // Cancel any pending long-press timer on unmount.
  useEffect(() => clear, [clear]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd: clear,
    onTouchCancel: clear,
  };
}
