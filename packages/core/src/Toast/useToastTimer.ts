// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useToastTimer.ts
 * @input The toast's auto-hide settings and a dismiss callback.
 * @output The timer, plus the pause/resume handlers to spread on whichever
 *   element the pointer and focus actually reach.
 * @position Extracted from Toast.tsx so the auto-hide lifetime belongs to the
 *   toast's TRANSPORT rather than to Astryx's card. A `renderToast` surface
 *   replaces the card; it must not replace the timer with it.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Toast/Toast.tsx
 * - /packages/core/src/Toast/ToastViewport.tsx
 */

import {useCallback, useEffect, useRef} from 'react';

/** The floor a resumed timer is clamped to, so a toast never flashes away. */
const MIN_RESUME_MS = 1000;

export interface ToastTimerHandlers {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocusCapture: () => void;
  onBlurCapture: () => void;
}

/**
 * Run a toast's auto-hide lifetime.
 *
 * The timer pauses while the pointer is over the toast, while focus is inside
 * it, and while the window itself is unfocused — a toast must not expire
 * silently in a tab the user is not looking at.
 *
 * @param isAutoHide - whether this toast dismisses itself at all
 * @param autoHideDuration - full lifetime in ms
 * @param onExpire - called once when the time runs out
 * @returns handlers to spread on the element the pointer and focus reach
 */
export function useToastTimer(
  isAutoHide: boolean,
  autoHideDuration: number,
  onExpire: () => void,
): ToastTimerHandlers {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedRef = useRef(false);
  const remainingRef = useRef(autoHideDuration);
  const startTimeRef = useRef<number | null>(null);

  // Read the callback through a ref: the viewport re-creates it on every
  // render (another toast arriving or exiting), and a startTimer that depended
  // on it would restart — and un-pause — this toast's timer on unrelated
  // renders.
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const startTimer = useCallback(() => {
    if (!isAutoHide || isPausedRef.current) {
      return;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onExpireRef.current();
    }, remainingRef.current);
  }, [isAutoHide]);

  const pauseTimer = useCallback(() => {
    if (!isAutoHide || isPausedRef.current) {
      return;
    }
    isPausedRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (startTimeRef.current != null) {
      const elapsed = Date.now() - startTimeRef.current;
      remainingRef.current = Math.max(
        remainingRef.current - elapsed,
        MIN_RESUME_MS,
      );
    }
  }, [isAutoHide]);

  const resumeTimer = useCallback(() => {
    if (!isAutoHide || !isPausedRef.current) {
      return;
    }
    isPausedRef.current = false;
    startTimer();
  }, [isAutoHide, startTimer]);

  useEffect(() => {
    remainingRef.current = autoHideDuration;
    startTimer();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // startTimer's identity is stable per isAutoHide, so this runs on mount
    // and on a genuine duration change — not on unrelated viewport renders.
  }, [autoHideDuration, startTimer]);

  useEffect(() => {
    if (!isAutoHide) {
      return;
    }
    window.addEventListener('blur', pauseTimer);
    window.addEventListener('focus', resumeTimer);
    return () => {
      window.removeEventListener('blur', pauseTimer);
      window.removeEventListener('focus', resumeTimer);
    };
  }, [isAutoHide, pauseTimer, resumeTimer]);

  return {
    onMouseEnter: pauseTimer,
    onMouseLeave: resumeTimer,
    onFocusCapture: pauseTimer,
    onBlurCapture: resumeTimer,
  };
}
