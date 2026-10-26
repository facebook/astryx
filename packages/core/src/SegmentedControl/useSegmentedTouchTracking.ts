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
 * pressed title's dim. A tap (the finger lifts on the segment it landed on,
 * with no drag) is committed by the browser's own click (`spec:AST-094`
 * FR11); the control waits for it and clicks the segment itself only if no
 * click comes. A drag, or a lift on another segment, gets no click from the
 * browser: the tracker clicks that segment at the lift and swallows any
 * click the browser sends after. Either way an item's consumer `onClick`
 * runs and can veto the selection with `preventDefault()`, exactly as under
 * a mouse, and the click path never runs twice. A vetoed click sends the
 * lens back at once; otherwise the motion waits for the value to come back
 * (a controlled parent may adopt it later) and sends the lens back only if
 * the slide settles without it.
 * Mouse, keyboard and assistive technology keep the click.
 *
 * While a finger is down, text selection and the touch callout are off on
 * the track: the drag recognizer brings the selection lock (`lockSelection`,
 * `spec:AST-094` FR41), so a hold lifts the lens and never starts a
 * selection; a mouse keeps desktop selection.
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
import {lockSelection} from '../gestures/selectionLock';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {
  SEGMENT_SELECTOR,
  type SegmentedSelectionMotion,
} from './useSegmentedSelectionMotion';

/**
 * How long a tap's lift waits for the browser's own click before the segment
 * is clicked directly, ms: the browser sends it with the lift's `touchend`
 * (the track has no double-tap delay), so this only runs out for a lift the
 * browser does not count as a click.
 */
const BROWSER_CLICK_WAIT_MS = 300;

/**
 * Waits for the browser's own click on `segment` after a tap and reports
 * whether a handler cancelled it; with no click in time, clicks the segment
 * itself (its activation and every handler run) and reports that. Either way
 * the tap activates once: the browser's click stops the wait as it arrives,
 * and one that comes after the segment was clicked (a busy main thread held
 * it past the wait) is swallowed.
 */
function awaitBrowserClick(
  segment: HTMLElement,
  onClicked: (isCancelled: boolean) => void,
): void {
  const view = segment.ownerDocument.defaultView;
  if (view == null) {
    return;
  }
  let isDone = false;
  const finish = (isCancelled: boolean) => {
    if (isDone) {
      return;
    }
    isDone = true;
    view.removeEventListener('click', grab, true);
    view.clearTimeout(timer);
    onClicked(isCancelled);
  };
  const grab = (event: MouseEvent) => {
    if (!event.isTrusted || !segment.contains(event.target as Node | null)) {
      return;
    }
    // The browser's click is the activation: the segment is not clicked
    // again, even by a wait that ran out while the main thread was busy.
    view.clearTimeout(timer);
    // After every handler has run: was it cancelled?
    view.setTimeout(() => finish(event.defaultPrevented), 0);
  };
  const timer = view.setTimeout(() => {
    if (isDone) {
      return;
    }
    view.removeEventListener('click', grab, true);
    finish(clickAndReport(segment));
    swallowLateClick(segment);
  }, BROWSER_CLICK_WAIT_MS);
  view.addEventListener('click', grab, true);
}

/**
 * After a tap's segment was clicked directly, the browser's own click for that
 * tap may still come (a busy main thread holds it past the wait): it is the
 * same activation, so it is swallowed before any handler sees it. Only until
 * the next press or key: any later click belongs to them.
 */
/**
 * Whether `event` is the browser's own late click on `segment` for the
 * activation the tracker already ran. A keyboard's or assistive
 * technology's activation (`detail === 0`) is never one: it always passes
 * (`spec:AST-094` FR21), as the shared tracker's swallower lets it.
 */
export function isLateClick(
  event: Pick<MouseEvent, 'isTrusted' | 'detail' | 'target'>,
  segment: HTMLElement,
): boolean {
  return (
    event.isTrusted &&
    event.detail !== 0 &&
    segment.contains(event.target as Node | null)
  );
}

function swallowLateClick(segment: HTMLElement): void {
  const view = segment.ownerDocument.defaultView;
  if (view == null) {
    return;
  }
  const stop = () => {
    view.removeEventListener('click', swallow, true);
    view.removeEventListener('pointerdown', stop, true);
    view.removeEventListener('touchstart', stop, true);
    view.removeEventListener('keydown', stop, true);
  };
  const swallow = (event: MouseEvent) => {
    if (!isLateClick(event, segment)) {
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    stop();
  };
  view.addEventListener('click', swallow, true);
  view.addEventListener('pointerdown', stop, {capture: true, passive: true});
  view.addEventListener('touchstart', stop, {capture: true, passive: true});
  view.addEventListener('keydown', stop, true);
}

/**
 * Clicks `segment` (its activation and every handler run) and reports
 * whether a handler cancelled the click.
 */
function clickAndReport(segment: HTMLElement): boolean {
  const view = segment.ownerDocument.defaultView;
  let clicked: Event | null = null;
  const grab = (event: Event) => {
    if (clicked == null && event.target === segment) {
      clicked = event;
    }
  };
  view?.addEventListener('click', grab, true);
  try {
    segment.click();
  } finally {
    view?.removeEventListener('click', grab, true);
  }
  return (clicked as Event | null)?.defaultPrevented === true;
}

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
  /** The horizontal pan began for this touch: it is a drag, not a tap. */
  const isDraggingRef = useRef(false);
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
          isDraggingRef.current = false;
          segmentsRef.current = measureSegments(track);
          tracker.begin(touch.x, touch.y);
          motion.begin(track, tracker.beganOn);
          break;
        case 'touchUpInside':
        case 'touchUpOutside': {
          isPressingRef.current = false;
          // Where the finger lifts decides, wherever it landed.
          tracker.move(touch.x, touch.y);
          const lifted = tracker.highlighted;
          const isTap =
            event === 'touchUpInside' &&
            !isDraggingRef.current &&
            lifted != null &&
            lifted === tracker.beganOn;
          const value = motion.release(lifted);
          if (value != null && isTap && lifted != null) {
            // A tap: the browser's own click commits it (spec:AST-094 FR11).
            tracker.cancel();
            awaitBrowserClick(lifted, isCancelled =>
              motion.clicked(track, value, isCancelled),
            );
          } else if (value != null) {
            // No click comes from the browser for a drag: the segment's own
            // click, inside the lift's event; its onClick may veto it.
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
        // No title is selectable under a held finger, as in UIKit: a hold on
        // the track does something (it lifts the lens), so this recognizer
        // brings the lock, and the host turns text selection and the callout
        // off on the track while a finger is down.
        selectionLock: lockSelection,
      }),
    recognizer => {
      if (recognizer.state === 'began') {
        isDraggingRef.current = true;
      }
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
