// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSheetOpenGesture.ts
 * @input Uses React, and the SheetDragSource contract from @astryxdesign/core
 * @output Exports useSheetOpenGesture and its option/result types
 * @position Lab hook; feeds core's BottomSheet `dragSource` prop
 *
 * EXPLORATION — not a settled API.
 *
 * Opening a bottom sheet by dragging up from the page, rather than from the
 * sheet (which is not there yet) or a button (which is a tap, not a drag).
 *
 * This hook is only the RECOGNIZER: it decides which touches are a sheet-open
 * pull and publishes their coordinates. What the sheet does with them —
 * presenting, tracking the finger, settling or falling back — is the sheet's
 * business, and lives in core.
 *
 * ## Why the recognizer must commit on the first move
 *
 * A browser hands out one chance to claim a touch. Measured on a 7-move sweep
 * (Chromium, iPhone 15 profile, CDP-dispatched touches):
 *
 * | preventDefault policy | moves still cancelable | page scrolled |
 * |---|---|---|
 * | every move            | all 7 | 0 px   |
 * | first move only       | 1-2   | 162 px |
 * | all but the third     | 1-3   | 137 px |
 * | never                 | 1     | 162 px |
 *
 * Let one move through and cancelability is gone for the rest of the gesture,
 * whatever you do afterwards — and the page has already scrolled out from
 * under the user. So there is no "watch a few frames, then decide": the
 * decision is made from what is knowable at `touchstart` (where the scroller
 * is, where the finger landed), taken on move 1, and then held for every move
 * until the finger lifts.
 *
 * This is the same shape BottomSheet's own scroll-edge handoff uses, for the
 * same reason.
 *
 * ## Where the gesture may come from
 *
 * `page-end` arms when the document is scrolled to its end. That is the one
 * place an upward pull cannot be mistaken for scrolling — there is no scroll
 * left in that direction — which is why it needs no threshold beyond a couple
 * of pixels of intent.
 *
 * `element` arms anywhere inside a region the app marks with `regionProps`: a
 * bottom dock, a summary bar, the lower third of a map. Use it when the page
 * has no natural end to pull past.
 *
 * There is deliberately no "screen bottom edge" mode. iOS Safari's address bar
 * and Android's gesture navigation both live in that strip, and a web page
 * that competes with them loses.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/SheetOpenGesture/useSheetOpenGesture.test.tsx
 * - /packages/lab/src/SheetOpenGesture/SheetOpenGesture.doc.mjs
 */

import {useEffect, useMemo, useRef} from 'react';
// Subpath, not the '@astryxdesign/core' barrel: a bare root import from lab is
// a runtime edge into core's ENTIRE public surface, and inside a consuming app
// it can resolve to core's source rather than its build — dragging every core
// component through that app's compiler. Every other value import in lab is a
// subpath for this reason; only erased `import type`s use the root.
import {
  createSheetDragSource,
  type SheetDragSource,
} from '@astryxdesign/core/BottomSheet';

/** Where an upward pull is allowed to become a sheet-open gesture. */
export type SheetOpenGestureOrigin = 'page-end' | 'element';

export interface UseSheetOpenGestureOptions {
  /**
   * Which touches are candidates.
   * - `page-end`: the document is scrolled to the bottom (default)
   * - `element`: the touch began inside the element given `regionProps`
   * @default 'page-end'
   */
  from?: SheetOpenGestureOrigin;
  /**
   * Turns the recognizer off without unmounting it. Set this to `false` while
   * the sheet is open, so a drag inside the open sheet is the sheet's own.
   * @default true
   */
  enabled?: boolean;
  /**
   * Upward travel, in px, before the pull is claimed. Small on purpose: the
   * claim has to happen on the first move that clears it, and every px spent
   * waiting is a px the sheet did not follow the finger for.
   * @default 6
   */
  thresholdPx?: number;
}

export interface UseSheetOpenGestureResult {
  /** Hand to `<BottomSheet dragSource={...} />`. */
  source: SheetDragSource;
  /** Spread on the region that owns the gesture. Only used by `from: 'element'`. */
  regionProps: {ref: (node: HTMLElement | null) => void};
}

/** Whether the document scroller has no downward scrolling left. */
function isDocumentAtEnd(): boolean {
  // `scrollingElement` is the right answer in both standards and quirks mode,
  // but it is null in a document that has neither (and in some test DOMs).
  const scroller = document.scrollingElement ?? document.documentElement;
  if (scroller == null) {
    return false;
  }
  // A page that does not scroll at all is trivially at its end, and is a
  // perfectly good place to pull a sheet up from.
  return (
    scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1
  );
}

/**
 * EXPLORATION. Recognizes an upward pull on the page as "open the sheet", and
 * publishes it for a `BottomSheet` to ride.
 *
 * Touch only: a mouse has no equivalent gesture, and a sheet that can only be
 * reached by dragging is unreachable by keyboard, by screen reader, and under
 * WCAG 2.5.7. Always keep a button, or leave the sheet peeking.
 *
 * @example
 * ```
 * const [isOpen, setIsOpen] = useState(false);
 * const {source} = useSheetOpenGesture({enabled: !isOpen});
 *
 * <>
 *   <Button onClick={() => setIsOpen(true)}>Nearby places</Button>
 *   <BottomSheet
 *     label="Nearby places"
 *     isOpen={isOpen}
 *     onOpenChange={setIsOpen}
 *     dragSource={source}>
 *     <PlaceList />
 *   </BottomSheet>
 * </>
 * ```
 */
export function useSheetOpenGesture({
  from = 'page-end',
  enabled = true,
  thresholdPx = 6,
}: UseSheetOpenGestureOptions = {}): UseSheetOpenGestureResult {
  // One controller for the hook's life. A new identity mid-gesture would
  // resubscribe the sheet and drop the drag it is riding.
  const controller = useMemo(() => createSheetDragSource(), []);
  const regionRef = useRef<HTMLElement | null>(null);
  const optionsRef = useRef({from, enabled, thresholdPx});
  optionsRef.current = {from, enabled, thresholdPx};

  useEffect(() => {
    // What the recognizer knows about the touch in flight. `eligible` and the
    // start point are decided at `touchstart` and never revisited; `claimed`
    // records that the gesture is ours and must stay cancelled.
    interface ArmedTouch {
      id: number;
      startY: number;
      startX: number;
      eligible: boolean;
      claimed: boolean;
    }
    let state: ArmedTouch | null = null;

    const onTouchStart = (event: TouchEvent) => {
      const {from: origin, enabled: isEnabled} = optionsRef.current;
      const touch = event.changedTouches[0];
      // Multi-touch is a pinch or a two-finger scroll, never a sheet pull.
      if (!isEnabled || touch == null || event.touches.length > 1) {
        state = null;
        return;
      }
      // Everything the decision rests on is read HERE. By the time the first
      // move arrives it is too late to go looking: claiming has to be the
      // first thing that move does.
      const target = event.target;
      const eligible =
        origin === 'element'
          ? regionRef.current != null &&
            target instanceof Node &&
            regionRef.current.contains(target)
          : isDocumentAtEnd();
      state = {
        id: touch.identifier,
        startY: touch.clientY,
        startX: touch.clientX,
        eligible,
        claimed: false,
      };
    };

    const onTouchMove = (event: TouchEvent) => {
      if (state == null) {
        return;
      }
      const touch = [...event.changedTouches].find(
        candidate => candidate.identifier === state?.id,
      );
      if (touch == null) {
        return;
      }
      const deltaY = touch.clientY - state.startY;
      const deltaX = touch.clientX - state.startX;

      if (state.claimed) {
        // Holding the claim is not optional — see the table in the file header.
        if (event.cancelable) {
          event.preventDefault();
        }
        controller.move({y: touch.clientY, timeStamp: event.timeStamp});
        return;
      }
      if (!state.eligible) {
        return;
      }
      // Downward, or mostly sideways: not ours. Disarm rather than keep
      // watching, so a scroll that later reverses upward is left alone.
      if (deltaY > 0 || Math.abs(deltaX) > Math.abs(deltaY)) {
        state = null;
        return;
      }
      if (-deltaY < optionsRef.current.thresholdPx) {
        return;
      }
      // A move the browser has already committed to scrolling cannot be
      // claimed, and a sheet dragged by a finger that is also scrolling the
      // page behind it is worse than no gesture at all.
      if (!event.cancelable) {
        state = null;
        return;
      }
      event.preventDefault();
      state.claimed = true;
      // Anchored at the touch, not at the threshold crossing, so the sheet
      // rises by the whole distance the finger has travelled.
      controller.start({y: state.startY, timeStamp: event.timeStamp});
      controller.move({y: touch.clientY, timeStamp: event.timeStamp});
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (state == null) {
        return;
      }
      const wasClaimed = state.claimed;
      const touch = [...event.changedTouches].find(
        candidate => candidate.identifier === state?.id,
      );
      state = null;
      if (!wasClaimed) {
        return;
      }
      if (touch == null) {
        controller.cancel();
        return;
      }
      controller.end({y: touch.clientY, timeStamp: event.timeStamp});
    };

    const onTouchCancel = () => {
      const wasClaimed = state?.claimed ?? false;
      state = null;
      if (wasClaimed) {
        controller.cancel();
      }
    };

    // Listeners on the document, not the region: `from: 'element'` still needs
    // every move of a gesture that STARTED in the region, including the ones
    // whose target has since left it, and by the end of a full-height pull the
    // finger is nowhere near where it began.
    document.addEventListener('touchstart', onTouchStart, {passive: true});
    document.addEventListener('touchmove', onTouchMove, {passive: false});
    document.addEventListener('touchend', onTouchEnd, {passive: true});
    document.addEventListener('touchcancel', onTouchCancel, {passive: true});
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchCancel);
      controller.cancel();
    };
  }, [controller]);

  const regionProps = useMemo(
    () => ({
      ref: (node: HTMLElement | null) => {
        regionRef.current = node;
      },
    }),
    [],
  );

  return {source: controller, regionProps};
}
