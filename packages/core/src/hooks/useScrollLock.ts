// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useScrollLock.ts
 * @input Uses React useEffect
 * @output Exports useScrollLock hook for locking body scroll
 * @position Core hook; used by Dialog to prevent background scrolling
 *
 * Locks body scroll when active by pinning the body with position:fixed.
 * This is needed because overscroll-behavior:contain doesn't work on iOS Safari.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 * - /packages/core/src/hooks/scrollbarGutter.ts
 */

import {useEffect} from 'react';
import {holdScrollbarGutter, type ScrollbarGutterHold} from './scrollbarGutter';

interface ScrollLockSnapshot {
  scrollX: number;
  scrollY: number;
  overflow: string;
  position: string;
  top: string;
  left: string;
  right: string;
  gutter: ScrollbarGutterHold;
}

let lockCount = 0;
let originalBodyState: ScrollLockSnapshot | null = null;

/**
 * Locks body scroll when `isLocked` is true.
 *
 * Pins the body with `position: fixed` to prevent background scrolling,
 * which is necessary for iOS Safari where `overscroll-behavior: contain`
 * does not prevent body scroll behind modals. Restores scroll position
 * on unlock.
 *
 * Pinning also hides the document's scrollbar, so the gutter that scrollbar
 * occupied is held open for the duration of the lock — without it the page
 * reflows sideways by ~15px the moment an overlay opens.
 *
 * @example
 * ```
 * useScrollLock(isOpen);
 * ```
 */
export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) {
      return;
    }

    const {body} = document;

    if (lockCount === 0) {
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      // Taken before the pinning styles below hide the scrollbar.
      const gutter = holdScrollbarGutter(body);

      originalBodyState = {
        scrollX,
        scrollY,
        overflow: body.style.overflow,
        position: body.style.position,
        top: body.style.top,
        left: body.style.left,
        right: body.style.right,
        gutter,
      };

      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.left = '0';
      body.style.right = '0';

      gutter.settle();
    }

    lockCount += 1;

    return () => {
      lockCount -= 1;

      if (lockCount !== 0 || originalBodyState == null) {
        return;
      }

      const state = originalBodyState;
      originalBodyState = null;

      body.style.overflow = state.overflow;
      body.style.position = state.position;
      body.style.top = state.top;
      body.style.left = state.left;
      body.style.right = state.right;
      state.gutter.release();
      window.scrollTo(state.scrollX, state.scrollY);
    };
  }, [isLocked]);
}
