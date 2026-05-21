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
 */

import {useEffect} from 'react';

/**
 * Locks body scroll when `isLocked` is true.
 *
 * Pins the body with `position: fixed` to prevent background scrolling,
 * which is necessary for iOS Safari where `overscroll-behavior: contain`
 * does not prevent body scroll behind modals. Restores scroll position
 * on unlock.
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

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const {body} = document;
    const prevOverflow = body.style.overflow;
    const prevPosition = body.style.position;
    const prevTop = body.style.top;
    const prevLeft = body.style.left;
    const prevRight = body.style.right;

    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';

    return () => {
      body.style.overflow = prevOverflow;
      body.style.position = prevPosition;
      body.style.top = prevTop;
      body.style.left = prevLeft;
      body.style.right = prevRight;
      window.scrollTo(scrollX, scrollY);
    };
  }, [isLocked]);
}
