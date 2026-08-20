// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useOwnScrollGesture.ts
 * @input A scroll container ref
 * @output Stops touch gestures on that container from reaching an ancestor
 * @position Internal behavior hook; consumed by Wheel.tsx and MonthScroller.tsx
 *
 * Lets a nested scroller keep the finger that lands on it.
 *
 * ## The conflict
 *
 * `BottomSheet` implements swipe-to-dismiss by watching touches on its
 * scrolling body: at the body's scroll top, a downward pull stops being a
 * scroll and becomes a sheet drag. That is right for ordinary sheet content,
 * and wrong for a scroller nested inside it — the test is `body.scrollTop`,
 * and the body of a sheet sized to hug its content never scrolls, so it reads
 * as "at the top" forever. Every downward drag anywhere inside therefore
 * promotes to a dismiss.
 *
 * Measured before this hook existed, with real touch events: a downward drag
 * on the calendar dismissed the sheet outright, and one on a wheel did nothing
 * at all — the sheet's `preventDefault()` killed the wheel's native scroll and
 * gave back a drag too small to see. Both scrollers were unusable by finger.
 *
 * ## Why this is the fix, and not a smarter handoff
 *
 * The tempting alternative is to release the gesture at the scroller's own
 * extremes, so pulling down at the top of the calendar still dismisses. It
 * cannot work from this side: the sheet anchors a promoted drag to the Y where
 * the finger first touched, so handing it a gesture mid-scroll moves the sheet
 * by everything the finger already spent scrolling — a jump the length of the
 * swipe. The sheet has machinery for exactly that case (`contentEndY`), but it
 * only runs for the sheet's own body, and reaching it would mean changing
 * `BottomSheet`.
 *
 * So the scroller takes the whole gesture. Dismissal stays available from the
 * grab handle and the picker's header, which is where a picker sheet on iOS
 * puts it anyway.
 *
 * ## Why native listeners
 *
 * React delegates its events at the root container, which is an ANCESTOR of
 * the sheet body — so a React `onTouchStart` would run after the body's own
 * listener had already claimed the gesture. `stopPropagation` has to happen on
 * a listener attached to the element itself, during the real bubble phase,
 * before the event ever reaches the body.
 *
 * `touchend`/`touchcancel` are deliberately left alone: they carry no
 * interpretation, and letting them through is what resets the sheet's
 * bookkeeping. Nothing here calls `preventDefault`, so the listeners stay
 * passive and the scroller keeps native momentum, snapping and rubber-banding.
 *
 * SYNC: When modified, update DateInputNext.test.tsx.
 */

import {useEffect} from 'react';

/**
 * Claim touch gestures that start on `ref`'s element, so an ancestor cannot
 * reinterpret them as its own drag.
 *
 * @param ref - the scroll container
 * @param isEnabled - skip while the scroller is hidden (a hidden panel keeps
 *   its layout box, so its listeners would otherwise still be live)
 */
export function useOwnScrollGesture(
  ref: React.RefObject<HTMLElement | null>,
  isEnabled: boolean = true,
): void {
  useEffect(() => {
    const element = ref.current;
    if (element == null || !isEnabled) {
      return;
    }
    // stopPropagation, never stopImmediatePropagation: other listeners on this
    // same element — including this component's own — must still run.
    const claim = (event: TouchEvent) => event.stopPropagation();
    element.addEventListener('touchstart', claim, {passive: true});
    element.addEventListener('touchmove', claim, {passive: true});
    return () => {
      element.removeEventListener('touchstart', claim);
      element.removeEventListener('touchmove', claim);
    };
  }, [ref, isEnabled]);
}
