// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSegmentedTouchTracking.ts
 * @input The radiogroup element, the selection motion controller and
 *   whether the touch presentation applies
 * @output Exports `useSegmentedTouchTracking`: a finger's touch on a
 *   SegmentedControl, from landing to letting go, reported to the selection
 *   motion (begin, lift, drag, highlight, release, cancel); and
 *   `segmentTargetAt` / `measureSegments`, the segment a finger at x counts
 *   for. The segment the finger lets go on is committed through its own
 *   click, by the action-group tracker
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
 * the lift still ends the press.
 *
 * Which segment the finger counts for, and the commit, are the action-group
 * tracker's (hooks/actionGroupTracker.ts), the one tracker of a held finger
 * across a group of targets: the segment under the finger, else the nearest
 * (a gap splits at its middle; past the ends, the end one; nothing over a
 * disabled segment), resolved from rects read once when the finger lands. Its highlight moves the
 * selected face (a carried lens) or the pressed title's dim. At the lift it
 * clicks that segment, so an item's consumer `onClick` runs first and can
 * veto the selection with `preventDefault()`, for a tap and a drag alike,
 * exactly as under a mouse; the browser's own click for that touch is
 * swallowed, so the click path never runs twice. A vetoed click sends the
 * lens back at once; otherwise the motion waits for the value to come back
 * (a controlled parent may adopt it later) and sends the lens back only if
 * a later render keeps the old value or the slide settles without it.
 * Mouse, keyboard and assistive technology keep the click.
 *
 * While a finger is down, the gesture host turns text selection and the
 * touch callout off on the track (`preventsTextSelection`), so a hold lifts
 * the lens and never starts a selection; a mouse keeps desktop selection.
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
import {
  createActionGroupTracker,
  type ActionGroupTarget,
  type ActionGroupTracker,
} from '../hooks/actionGroupTracker';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {
  SEGMENT_SELECTOR,
  type SegmentedSelectionMotion,
} from './useSegmentedSelectionMotion';

/** A ref to nothing: hooks given it attach nothing. */
const DETACHED: RefObject<HTMLElement | null> = {current: null};

/** A segment as measured when the finger landed: its viewport span, px. */
export interface SegmentSpan {
  readonly element: HTMLElement;
  readonly left: number;
  readonly right: number;
}

/** Every segment of `track`, disabled ones included, measured once. */
export function measureSegments(track: HTMLElement): SegmentSpan[] {
  return Array.from(
    track.querySelectorAll<HTMLElement>(SEGMENT_SELECTOR),
    element => {
      const rect = element.getBoundingClientRect();
      return {element, left: rect.left, right: rect.right};
    },
  );
}

function isDisabled(element: HTMLElement): boolean {
  return (
    element.hasAttribute('disabled') ||
    element.getAttribute('aria-disabled') === 'true'
  );
}

/**
 * The segment a finger at viewport `x` counts for: the one under it, else
 * the nearest (a gap between two segments splits at its middle, as UIKit's
 * segments share an edge; past the ends, the end segment), or null when
 * that one is disabled.
 */
export function segmentTargetAt(
  x: number,
  segments: ReadonlyArray<SegmentSpan>,
): HTMLElement | null {
  let best: SegmentSpan | null = null;
  let distance = Infinity;
  for (const segment of segments) {
    const d = Math.max(segment.left - x, 0, x - segment.right);
    if (d < distance) {
      distance = d;
      best = segment;
    }
  }
  return best != null && !isDisabled(best.element) ? best.element : null;
}

export function useSegmentedTouchTracking(
  trackRef: RefObject<HTMLElement | null>,
  motion: SegmentedSelectionMotion,
  isEnabled: boolean,
): void {
  const isEnabledRef = useRef(isEnabled);
  useIsomorphicLayoutEffect(() => {
    isEnabledRef.current = isEnabled;
  });
  /** A finger is down on the track (its press has not ended). */
  const isPressingRef = useRef(false);
  /** The segments as the finger found them (disabled ones too). */
  const segmentsRef = useRef<SegmentSpan[]>([]);
  const trackerRef = useRef<ActionGroupTracker | null>(null);
  const tracker = (trackerRef.current ??= createActionGroupTracker(() => ({
    roots: () => [trackRef.current],
    itemSelector: SEGMENT_SELECTOR,
    highlightExpansion: 0,
    // The highlight shows as the selected face or the pressed title's dim,
    // not as press paint.
    paintsHighlight: false,
    resolveTarget: (
      x: number,
      _y: number,
      _targets: ReadonlyArray<ActionGroupTarget>,
    ) => segmentTargetAt(x, segmentsRef.current),
    onHighlightChange: next => motion.highlight(next),
    onActivated: (item, cancelled) => {
      const track = trackRef.current;
      const value = item.dataset.value;
      if (track != null && value != null) {
        motion.clicked(track, value, cancelled);
      }
    },
    swallowsNativeClick: true,
  })));
  useIsomorphicLayoutEffect(() => () => tracker.dispose(), [tracker]);

  // Outside the touch presentation (a fine pointer) nothing is attached: the
  // track keeps today's touch-action and click.
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
          segmentsRef.current = measureSegments(track);
          tracker.begin(touch.x, touch.y);
          motion.begin(track, tracker.beganOn);
          break;
        case 'touchUpInside':
        case 'touchUpOutside': {
          isPressingRef.current = false;
          // Where the finger lifts decides, wherever it landed.
          tracker.move(touch.x, touch.y);
          const value = motion.release(tracker.highlighted);
          if (value != null) {
            // The segment's own click, inside the lift's event: its
            // onClick may veto the commit.
            tracker.end();
          } else {
            tracker.cancel();
          }
          break;
        }
        case 'touchCancel':
          isPressingRef.current = false;
          tracker.cancel();
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
        // No title is selectable under a held finger, as in UIKit: the host
        // turns text selection and the callout off on the track while a
        // finger is down (the press tracker's element gets the same lock).
        preventsTextSelection: true,
      }),
    recognizer => {
      if (recognizer.state === 'began' || recognizer.state === 'changed') {
        const {x, y} = recognizer.location();
        // The lens chases the finger, then the tracker moves the highlight.
        motion.drag(x);
        tracker.move(x, y);
      }
    },
    {isEnabled},
  );
}
