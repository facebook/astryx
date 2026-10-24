// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useScrollLock.ts
 * @input Uses React useEffect, the root scroll-style owner, the scroll-lock
 *   touch guard and the scrollbar gutter hold
 * @output Exports useScrollLock hook for locking page scroll behind a modal
 * @position Core hook; used by Dialog, BottomSheet, Drawer and Lightbox to
 *   prevent background scrolling
 *
 * Holds the page where it is. `overflow: hidden` on the root, claimed through
 * rootScrollStyles, stops wheel, keyboard and scrollbar scrolling. On touch
 * screens a guard also cancels the one-finger pans that would still scroll
 * the page, because iOS Safari before 26.4 scrolls an `overflow: hidden` page
 * under a finger. The page's scroll offset never changes, so there is nothing
 * to restore on unlock, and iOS Safari's toolbar keeps the state it had.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 * - /packages/core/src/hooks/scrollbarGutter.ts
 * - /packages/core/src/hooks/rootScrollStyles.ts
 */

import {useEffect} from 'react';
import {claimRootScrollStyle, reportScrollLock} from './rootScrollStyles';
import {installScrollLockTouchGuard} from './scrollLockTouchGuard';
import {holdScrollbarGutter, type ScrollbarGutterHold} from './scrollbarGutter';

interface ActiveLock {
  releaseRootStyle: () => void;
  removeTouchGuard: () => void;
  gutter: ScrollbarGutterHold;
}

let lockCount = 0;
let activeLock: ActiveLock | null = null;

/**
 * Locks page scroll while `isLocked` is true.
 *
 * The page stays where it is: the root gets `overflow: hidden`, and on touch
 * screens a one-finger pan that would reach the page is cancelled, while pans
 * that a scroller inside the overlay can take, and two-finger zoom, go through.
 * The scroll offset never changes, so nothing jumps on lock or unlock.
 *
 * Hiding the root's scrollbar would widen the layout where that scrollbar
 * takes space (desktop), so its gutter is held open for the duration of the
 * lock and the page does not shift sideways.
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

    if (lockCount === 0) {
      // Taken before the root's overflow hides the scrollbar.
      const gutter = holdScrollbarGutter(document.documentElement);
      const releaseRootStyle = claimRootScrollStyle({overflow: 'hidden'});
      const removeTouchGuard = installScrollLockTouchGuard();
      gutter.settle();
      activeLock = {releaseRootStyle, removeTouchGuard, gutter};
    }

    lockCount += 1;
    reportScrollLock(1);

    return () => {
      lockCount -= 1;
      reportScrollLock(-1);

      if (lockCount !== 0 || activeLock == null) {
        return;
      }

      const lock = activeLock;
      activeLock = null;
      lock.removeTouchGuard();
      lock.releaseRootStyle();
      lock.gutter.release();
    };
  }, [isLocked]);
}
