// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSegmentedTouchTracking.ts
 * @input The radiogroup element, the selection motion controller, whether
 *   the touch presentation applies, and a commit callback
 * @output Exports `useSegmentedTouchTracking`: a finger's touch on a
 *   SegmentedControl, from landing to letting go, reported to the selection
 *   motion (begin, lift, drag, release, cancel); the value the finger lets go
 *   on is committed through the callback
 * @position Internal to SegmentedControl's touch presentation; the motion it
 *   drives is useSegmentedSelectionMotion.ts
 *
 * UISegmentedControl tracks a touch itself, the way a UIControl does: it
 * reacts on touch-down, follows the finger and acts at the lift, where the
 * segment nearest the finger wins, wherever the finger landed. Inside a
 * scroll view the touch reaches it only after UIScrollView's content-touch
 * delay, and a scroll that takes the touch cancels it.
 *
 * The gesture system's press tracker is that UIControl tracking: `touchDown`
 * when the finger lands, the highlight on at once or after the content-touch
 * delay inside a scroller (the lens lifts with it), `touchUpInside` /
 * `touchUpOutside` at the lift, `touchCancel` when the browser takes the
 * touch to scroll. It never claims the finger, so a vertical drag still
 * scrolls the page.
 *
 * A horizontal pan carries the lens. It claims the finger only once the
 * finger has travelled sideways past the pan's slop (the track gets
 * `touch-action: pan-y` from it), and it does not cancel the press tracker:
 * the lift still ends the press, and a recognized pan swallows the click.
 * A tap's click still runs the click path, committing the value the lift
 * already committed (a no-op). Mouse, keyboard and assistive technology keep
 * the click.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/SegmentedControl/useSegmentedSelectionMotion.ts
 * - /packages/core/src/SegmentedControl/__tests__/SegmentedControl.interaction.browser.spec.ts
 */

import {useRef, type RefObject} from 'react';
import {
  PanGestureRecognizer,
  useGestureRecognizer,
  usePressTracker,
} from '../gestures';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import type {SegmentedSelectionMotion} from './useSegmentedSelectionMotion';

/** A ref to nothing: hooks given it attach nothing. */
const DETACHED: RefObject<HTMLElement | null> = {current: null};

export function useSegmentedTouchTracking(
  trackRef: RefObject<HTMLElement | null>,
  motion: SegmentedSelectionMotion,
  isEnabled: boolean,
  onCommit: (value: string) => void,
): void {
  const isEnabledRef = useRef(isEnabled);
  useIsomorphicLayoutEffect(() => {
    isEnabledRef.current = isEnabled;
  });
  /** A finger is down on the track (its press has not ended). */
  const isPressingRef = useRef(false);
  // Outside the touch presentation (a mouse, Android) nothing is attached:
  // the track keeps today's touch-action and click.
  const attachRef = isEnabled ? trackRef : DETACHED;
  usePressTracker(attachRef, {
    isEnabled: () => isEnabledRef.current,
    onControlEvent: (event, touch) => {
      const track = trackRef.current;
      // A mouse keeps the click path.
      if (track == null || touch.pointerType === 'mouse') {
        return;
      }
      switch (event) {
        case 'touchDown':
          isPressingRef.current = true;
          motion.begin(track, touch.x);
          break;
        case 'touchUpInside':
        case 'touchUpOutside': {
          isPressingRef.current = false;
          const value = motion.release(touch.x);
          if (value != null) {
            onCommit(value);
          }
          break;
        }
        case 'touchCancel':
          isPressingRef.current = false;
          motion.cancel();
          break;
        case 'touchDragInside':
        case 'touchDragOutside':
        case 'touchDragEnter':
        case 'touchDragExit':
          // The horizontal pan carries the lens.
          break;
      }
    },
    onHighlightChange: isHighlighted => {
      // The press is on: at touch-down, or after a scroller's delay. A quick
      // tap's highlight flash after the lift lifts nothing.
      if (isHighlighted && isPressingRef.current) {
        motion.lift();
      }
    },
  });
  useGestureRecognizer(
    attachRef,
    () =>
      new PanGestureRecognizer({
        name: 'segmented-control-drag',
        direction: 'horizontal',
        cancelsTouchesInView: false,
      }),
    recognizer => {
      if (recognizer.state === 'began' || recognizer.state === 'changed') {
        motion.drag(recognizer.location().x);
      }
    },
    {isEnabled},
  );
}
