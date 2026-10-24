// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSegmentedTouchTracking.ts
 * @input The radiogroup element, the selection motion controller, whether
 *   the touch presentation applies, and a commit callback
 * @output Exports `useSegmentedTouchTracking`: a finger's touch on a
 *   SegmentedControl, from landing to letting go, reported to the selection
 *   motion (lift, drag, release, cancel); the value the finger lets go on is
 *   committed through the callback
 * @position Internal to SegmentedControl's touch presentation; the motion it
 *   drives is useSegmentedSelectionMotion.ts
 *
 * UISegmentedControl tracks a touch itself, the way a UIControl does: it
 * reacts on touch-down, follows the finger and acts at the lift, where the
 * segment nearest the finger wins, wherever the finger landed. A press
 * recognizer with no minimum duration begins on the touch itself and
 * reports every move, which is that tracking; when it begins it swallows the
 * browser's click for the touch, so a touch selects exactly once, at the
 * lift. Mouse, keyboard and assistive technology keep the click path.
 *
 * A horizontal pan recognized alongside it gives the track
 * `touch-action: pan-y`: a sideways drag stays with the control, a vertical
 * one still scrolls the page (and cancels the touch, which puts the lens
 * back).
 *
 * SYNC: When modified, update:
 * - /packages/core/src/SegmentedControl/useSegmentedSelectionMotion.ts
 * - /packages/core/src/SegmentedControl/__tests__/SegmentedControl.interaction.browser.spec.ts
 */

import type {RefObject} from 'react';
import {
  LongPressGestureRecognizer,
  PanGestureRecognizer,
  useGestureRecognizer,
} from '../gestures';
import type {SegmentedSelectionMotion} from './useSegmentedSelectionMotion';

/** A ref to nothing: hooks given it attach nothing. */
const DETACHED: RefObject<HTMLElement | null> = {current: null};

export function useSegmentedTouchTracking(
  trackRef: RefObject<HTMLElement | null>,
  motion: SegmentedSelectionMotion,
  isEnabled: boolean,
  onCommit: (value: string) => void,
): void {
  // Outside the touch presentation (a mouse, Android) nothing is attached:
  // the track keeps today's touch-action and click.
  const attachRef = isEnabled ? trackRef : DETACHED;
  const tracking = useGestureRecognizer(
    attachRef,
    () =>
      new LongPressGestureRecognizer({
        name: 'segmented-control-touch',
        minimumPressDuration: 0,
      }),
    recognizer => {
      const track = trackRef.current;
      if (track == null) {
        return;
      }
      const {x} = recognizer.location();
      switch (recognizer.state) {
        case 'began':
          motion.press(track, x);
          break;
        case 'changed':
          motion.drag(x);
          break;
        case 'ended': {
          const value = motion.release(x);
          if (value != null) {
            onCommit(value);
          }
          break;
        }
        case 'cancelled':
        case 'failed':
          motion.cancel();
          break;
        case 'possible':
          break;
      }
    },
    {isEnabled},
  );
  useGestureRecognizer(
    attachRef,
    () =>
      new PanGestureRecognizer({
        name: 'segmented-control-drag-axis',
        direction: 'horizontal',
        cancelsTouchesInView: false,
      }).recognizeSimultaneouslyWith(tracking),
    undefined,
    {isEnabled},
  );
}
