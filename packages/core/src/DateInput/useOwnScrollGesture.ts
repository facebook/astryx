// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useOwnScrollGesture.ts
 * @input A scroll container ref and which axis it owns
 * @output Stops touch gestures on that container from reaching an ancestor
 * @position Internal behavior hook; consumed by Wheel.tsx and MonthScroller.tsx
 *
 * Lets a nested scroller keep the finger that lands on it.
 *
 * ## The conflict
 *
 * `BottomSheet` implements swipe-to-dismiss by watching touches on its
 * scrolling body: at the body's scroll top, a downward pull stops being a
 * scroll and becomes a sheet drag. The test is `body.scrollTop`, and the body
 * of a sheet sized to hug its content never scrolls, so it reads as "at the
 * top" forever — every downward-ish drag anywhere inside promotes to a drag.
 *
 * `touch-action` does NOT protect against this. It governs what the BROWSER
 * will pan natively; the sheet's listener is JavaScript, and its
 * `preventDefault()` cancels the native scroll whatever `touch-action` says.
 * Measured: with `touch-action: pan-x` on the month scroller, a swipe just 9°
 * off horizontal (120px across, 20px down — an ordinary thumb arc) had every
 * `touchmove` cancelled by the sheet, so the calendar did not move at all and
 * the sheet sprang back. The month simply would not change.
 *
 * ## Two ways to own a gesture
 *
 * - `'all'` — the wheels. They scroll vertically, exactly the axis the sheet
 *   wants, so there is no way to share: the scroller takes every touch that
 *   lands on it and the sheet is dismissed from the handle, the header or the
 *   scrim instead.
 *
 * - `'inline'` — the month scroller. It pages sideways, so the two CAN share
 *   by direction: lock the axis on the first significant move, claim the
 *   gesture only when it is horizontal, and let vertical ones through so
 *   swipe-to-dismiss still works on the calendar.
 *
 * ## Where the line falls
 *
 * An `'inline'` owner claims a gesture whose vertical travel is at most
 * `verticalDominance` times its horizontal travel, decided on the first move
 * past a few pixels. The month grid passes UIDatePicker's measured split
 * (`datePicker.calendar.pager.sheetAxisRatio`, 45°): a steeper drag is the
 * sheet's. The grid itself pans only inside its pager's tighter axis lock,
 * so a drag between the two moves neither, which is what UIKit does.
 *
 * ## Why native listeners
 *
 * React delegates its events at the root container, which is an ANCESTOR of
 * the sheet body — so a React `onTouchStart` would run after the body's own
 * listener had already claimed the gesture. `stopPropagation` has to happen on
 * a listener attached to the element itself, during the real bubble phase,
 * before the event ever reaches the body.
 *
 * Nothing here calls `preventDefault`, so the listeners stay passive; the
 * owner's own recognizers decide what the claimed gesture does.
 *
 * SYNC: When modified, update DateInputTouch.test.tsx.
 */

import {useEffect} from 'react';

/** Movement below this is noise, not a direction. */
const AXIS_LOCK_SLOP = 6;

export type OwnedAxis = 'all' | 'inline';

export type OwnScrollGestureOptions = {
  /** Skip while the scroller is hidden; a hidden panel keeps its layout box,
   * so its listeners would otherwise still be live. */
  isEnabled?: boolean;
  /**
   * `'inline'` only: the largest ratio of vertical to horizontal travel the
   * owner still claims. @default 1 (the diagonal)
   */
  verticalDominance?: number;
};

/**
 * Claim touch gestures that start on `ref`'s element, so an ancestor cannot
 * reinterpret them as its own drag.
 *
 * @param ref - the scroll container
 * @param axis - `'all'` to take every touch, `'inline'` to take only the
 *   horizontal ones and leave vertical drags to the sheet
 * @param options - see {@link OwnScrollGestureOptions}
 */
export function useOwnScrollGesture(
  ref: React.RefObject<HTMLElement | null>,
  axis: OwnedAxis = 'all',
  options: OwnScrollGestureOptions = {},
): void {
  const {isEnabled = true, verticalDominance = 1} = options;

  useEffect(() => {
    const element = ref.current;
    if (element == null || !isEnabled) {
      return;
    }

    // null = not yet decided; true = ours for the rest of this gesture.
    let claimed: boolean | null = null;
    let originX = 0;
    let originY = 0;

    const begin = (x: number, y: number) => {
      originX = x;
      originY = y;
      // 'all' decides at the start, before the sheet's own start listener
      // records an armed edge. 'inline' cannot decide yet (a touch has no
      // direction until it moves), so it lets the start through and locks on
      // the first move that clears the slop.
      claimed = axis === 'all' ? true : null;
    };

    /** Whether a move at (x, y) belongs to this element; decides once. */
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

    const onStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      begin(touch?.clientX ?? 0, touch?.clientY ?? 0);
      if (claimed) {
        event.stopPropagation();
      }
    };

    const onMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch != null && owns(touch.clientX, touch.clientY)) {
        event.stopPropagation();
      }
    };

    // The same finger also arrives as pointer events, ahead of its touch
    // events, and the sheet drags from those too: they get the same
    // decision. (A natively panned gesture used to end them with a
    // pointercancel; a gesture recognizer's does not.)
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || !event.isPrimary) {
        return;
      }
      begin(event.clientX, event.clientY);
      if (claimed) {
        event.stopPropagation();
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || !event.isPrimary) {
        return;
      }
      if (owns(event.clientX, event.clientY)) {
        event.stopPropagation();
      }
    };

    const onEnd = () => {
      // touchend/touchcancel deliberately propagate: they carry no
      // interpretation, and letting them through is what resets the sheet's
      // bookkeeping.
      claimed = null;
    };

    element.addEventListener('pointerdown', onPointerDown, {passive: true});
    element.addEventListener('pointermove', onPointerMove, {passive: true});
    element.addEventListener('touchstart', onStart, {passive: true});
    element.addEventListener('touchmove', onMove, {passive: true});
    element.addEventListener('touchend', onEnd, {passive: true});
    element.addEventListener('touchcancel', onEnd, {passive: true});
    return () => {
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('touchstart', onStart);
      element.removeEventListener('touchmove', onMove);
      element.removeEventListener('touchend', onEnd);
      element.removeEventListener('touchcancel', onEnd);
    };
  }, [ref, axis, isEnabled, verticalDominance]);
}
