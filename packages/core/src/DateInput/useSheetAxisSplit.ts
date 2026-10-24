// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSheetAxisSplit.ts
 * @input A horizontally paging element's ref and the steepest drag it keeps
 * @output useSheetAxisSplit: keeps a bottom sheet's touch and pointer
 *   listeners off the drags that belong to the element
 * @position Internal behavior hook; consumed by MonthPager.tsx (the month
 *   grid under a finger). Today's MonthScroller keeps useOwnScrollGesture.
 *
 * `BottomSheet` drags from the touches and the pointer events that bubble to
 * its body. A month pager driven by a gesture recognizer (hooks/usePager.ts)
 * pans with JavaScript, not natively, so nothing cancels those events the way
 * a native pan's `pointercancel` did: without this, the sheet would promote
 * a sideways drag on the calendar into a sheet drag.
 *
 * The decision is UIDatePicker's: on the first move past a few pixels, a drag
 * whose vertical travel is at most `verticalDominance` times its horizontal
 * travel is the pager's (`datePicker.calendar.pager.sheetAxisRatio`, 45°) and
 * stops at the element; a steeper one reaches the sheet. The pager itself pans
 * only within its tighter axis lock, so a drag in between moves neither, as
 * in UIKit. A finger's pointer events (which arrive ahead of its touch events)
 * get the same decision as its touch events.
 *
 * Native listeners on the element, in the bubble phase, so they run before
 * the sheet's listener on its body; all passive, so nothing here cancels a
 * default action.
 *
 * SYNC: When modified, update DateInputTouch.test.tsx.
 */

import {useEffect} from 'react';

/** Movement below this is noise, not a direction. */
const AXIS_LOCK_SLOP = 6;

/**
 * Keeps the sheet off the drags on `ref`'s element no steeper than
 * `verticalDominance` (vertical over horizontal travel).
 *
 * @example
 * ```
 * useSheetAxisSplit(viewportRef, {verticalDominance: 1});
 * ```
 */
export function useSheetAxisSplit(
  ref: React.RefObject<HTMLElement | null>,
  {
    verticalDominance = 1,
    isEnabled = true,
  }: {verticalDominance?: number; isEnabled?: boolean} = {},
): void {
  useEffect(() => {
    const element = ref.current;
    if (element == null || !isEnabled) {
      return undefined;
    }
    // null while the direction is still undecided.
    let claimed: boolean | null = null;
    let originX = 0;
    let originY = 0;

    const begin = (x: number, y: number) => {
      originX = x;
      originY = y;
      claimed = null;
    };

    /** Whether a move at (x, y) belongs to the element; decides once. */
    const owns = (x: number, y: number): boolean => {
      if (claimed == null) {
        const dx = Math.abs(x - originX);
        const dy = Math.abs(y - originY);
        if (Math.max(dx, dy) < AXIS_LOCK_SLOP) {
          return false;
        }
        claimed = dy <= dx * verticalDominance;
      }
      return claimed;
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      begin(touch?.clientX ?? 0, touch?.clientY ?? 0);
    };
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch != null && owns(touch.clientX, touch.clientY)) {
        event.stopPropagation();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch' && event.isPrimary) {
        begin(event.clientX, event.clientY);
      }
    };
    const onPointerMove = (event: PointerEvent) => {
      if (
        event.pointerType === 'touch' &&
        event.isPrimary &&
        owns(event.clientX, event.clientY)
      ) {
        event.stopPropagation();
      }
    };
    // The end of a gesture carries no interpretation: it propagates, and
    // resets the sheet's bookkeeping.
    const onEnd = () => {
      claimed = null;
    };

    element.addEventListener('pointerdown', onPointerDown, {passive: true});
    element.addEventListener('pointermove', onPointerMove, {passive: true});
    element.addEventListener('touchstart', onTouchStart, {passive: true});
    element.addEventListener('touchmove', onTouchMove, {passive: true});
    element.addEventListener('touchend', onEnd, {passive: true});
    element.addEventListener('touchcancel', onEnd, {passive: true});
    return () => {
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onEnd);
      element.removeEventListener('touchcancel', onEnd);
    };
  }, [ref, isEnabled, verticalDominance]);
}
