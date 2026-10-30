// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSheetAxisSplit.ts
 * @input A horizontally paging element's ref
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
 * The decision is UIDatePicker's in a sheet: on the first move where either
 * axis has travelled the pan's hysteresis (10 px), the drag is the pager's
 * when its sideways travel has reached it there and the sheet's otherwise.
 * For a steady drag that is 45°; a fast drag whose first move jumps 10 px
 * sideways is the pager's however steep. The moves before the decision reach
 * neither, so the sheet's own drag promotion (8 px) cannot start ahead of it:
 * UIKit's sheet pan and the grid's begin on the same sample. A finger's
 * pointer events (which arrive ahead of its touch events) get the same
 * decision as its touch events.
 *
 * Native listeners on the element, in the bubble phase, so they run before
 * the sheet's listener on its body; all passive, so nothing here cancels a
 * default action.
 *
 * SYNC: When modified, update DateInputTouch.test.tsx.
 */

import {useEffect} from 'react';

import {UIKIT_GESTURES} from '../motion/uikit/gestures';

/**
 * The travel, on either axis, at which a drag on the grid is decided: the
 * pan's hysteresis, where UIKit begins both the sheet's pan and the grid's.
 *
 * @source measured: UIKit lab, iOS 26.2 simulator, `.date` `.inline` in a
 *   medium-detent sheet, 100 pt drags from the grid at 45°, 47.5°, 50°,
 *   52.5° and 55°, slow and fast, three each, logged per touch sample
 *   (motion/MEASUREMENTS.md M-DP01), Oct 25 2026: every drag was decided on
 *   the first sample where |dx| or |dy| reached 10 pt; the grid took it when
 *   |dx| had (first samples (10.0, 11.0), (10.7, 12.7)) and the sheet when
 *   only |dy| had ((9.7, 11.3), (8.0, 10.3))
 */
const DECISION_TRAVEL = UIKIT_GESTURES.pan.hysteresis.value;

/**
 * Keeps the sheet off the drags on `ref`'s element that UIKit gives the grid,
 * and off every move before the decision.
 *
 * @example
 * ```
 * useSheetAxisSplit(viewportRef);
 * ```
 */
export function useSheetAxisSplit(
  ref: React.RefObject<HTMLElement | null>,
  {isEnabled = true}: {isEnabled?: boolean} = {},
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

    /**
     * Whether a move at (x, y) is kept from the sheet: until the decision,
     * and after it when the drag is the element's. Decides once.
     */
    const isKept = (x: number, y: number): boolean => {
      if (claimed == null) {
        const dx = Math.abs(x - originX);
        const dy = Math.abs(y - originY);
        if (Math.max(dx, dy) < DECISION_TRAVEL) {
          return true;
        }
        claimed = dx >= DECISION_TRAVEL;
      }
      return claimed;
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      begin(touch?.clientX ?? 0, touch?.clientY ?? 0);
    };
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch != null && isKept(touch.clientX, touch.clientY)) {
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
        isKept(event.clientX, event.clientY)
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
  }, [ref, isEnabled]);
}
