// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useScrollSettle.ts
 * @input A scroll container ref and a settle callback
 * @output Calls back once, after scrolling (including snap animation) stops
 * @position Internal behavior hook; consumed by Wheel.tsx and MonthScroller.tsx
 *
 * A snap scroller commits its value when it comes to rest, so it needs a
 * "scrolling stopped" signal. `scrollend` is that signal, but it is recent
 * enough that mobile Safari below 26 does not have it — and it is exactly the
 * browser this component targets. So: listen for `scrollend` where it exists,
 * and fall back to a quiet-period timer everywhere else. The same
 * belt-and-braces pattern is in core's `useScrollSpy`.
 *
 * The timer is armed on every scroll tick and only fires once the scroller has
 * been quiet for `quietMs`. It must outlast the browser's own snap animation
 * (~150-300ms after the finger lifts), or the wheel would commit to whichever
 * option it was passing rather than the one it settles on.
 *
 * SYNC: When modified, update DateInputMobile.test.tsx.
 */

import {useEffect, useRef} from 'react';

/** How long the scroller must be quiet before a settle is assumed. */
export const SCROLL_QUIET_MS = 220;

/**
 * Run `onSettle` when `ref`'s element stops scrolling.
 *
 * @param ref - the scroll container
 * @param onSettle - called with the settled element; may change every render
 * @param isEnabled - skip attaching while false (e.g. a hidden panel)
 */
export function useScrollSettle(
  ref: React.RefObject<HTMLElement | null>,
  onSettle: (element: HTMLElement) => void,
  isEnabled: boolean = true,
): void {
  // The callback closes over render-fresh values (the option list, the current
  // value); keeping it in a ref means the listeners attach once instead of
  // re-attaching mid-scroll, which would drop an in-flight settle.
  const onSettleRef = useRef(onSettle);
  onSettleRef.current = onSettle;

  useEffect(() => {
    const element = ref.current;
    if (element == null || !isEnabled) {
      return;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    let hasSettled = false;

    const settle = () => {
      if (hasSettled) {
        return;
      }
      hasSettled = true;
      clearTimeout(timer);
      onSettleRef.current(element);
    };

    const onScroll = () => {
      // A fresh scroll re-opens the window: whatever we settle on now is
      // stale, and the settle that matters is the one after this gesture.
      hasSettled = false;
      clearTimeout(timer);
      timer = setTimeout(settle, SCROLL_QUIET_MS);
    };

    element.addEventListener('scroll', onScroll, {passive: true});
    element.addEventListener('scrollend', settle);

    return () => {
      clearTimeout(timer);
      element.removeEventListener('scroll', onScroll);
      element.removeEventListener('scrollend', settle);
    };
  }, [ref, isEnabled]);
}
