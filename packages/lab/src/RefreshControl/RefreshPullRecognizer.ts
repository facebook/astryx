// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RefreshPullRecognizer.ts
 * @input Touches from the gesture arena (core's internal gestures modules)
 * @output Exports RefreshPullRecognizer: the vertical pan that reads a pull
 *   to refresh without taking the touch from the browser
 * @position The gesture of RefreshControl, on the foundation's
 *   PanGestureRecognizer
 *
 * UIKit's refresh pull is the scroll view's own drag, not a second gesture:
 * pulling past the top reveals the control, a drag that began as a scroll
 * pulls once the content runs out, and pushing back keeps scrolling the same
 * content, all in one touch. So this pan never claims its touch: it only
 * watches (`spec:AST-094` FR20, DEC-7). The browser keeps the finger for
 * native scrolling, so nothing changes hands midway (FR14), and the pan
 * reads the finger to draw the overscroll (the scroll owner's
 * `overscroll-behavior-y` is `none` near the top, so the browser itself has
 * nothing to draw there):
 *
 * - it begins on vertical travel past the pan's hysteresis; the touch layer
 *   starts the pull where the content is at its top under a finger moving
 *   down (refreshTouchController.ts);
 * - when the browser takes the touch to scroll, it keeps reading it to the
 *   lift;
 * - one finger: a second finger is the browser's (pinch-zoom).
 *
 * Every pointer reads the same way (`spec:AST-094` FR43): a pen's or a
 * mouse's drag pulls as a finger's does. A trackpad's two-finger scroll
 * pulls through a second instance that takes only that scroll (scroll-edge,
 * `allowedScrollTypes: ['continuous']`, no pointer), so it takes a scroll
 * only where nothing under the pointer could scroll for it.
 * `pointerType` and `scrollType` record the first contact's input, and
 * `onTouchDown` reports that first contact landing, so a settle in flight can
 * stop where it is (UIScrollView brakes on touch-down).
 *
 * SYNC: When modified, update:
 * - /packages/lab/src/RefreshControl/useRefreshControl.ts
 */

import {
  PanGestureRecognizer,
  type PanGestureRecognizerOptions,
} from '@astryxdesign/core/internal/touch';
import type {
  GestureEventContext,
  GestureTouch,
  PointerKind,
} from '@astryxdesign/core/internal/touch';

export class RefreshPullRecognizer extends PanGestureRecognizer {
  /** Called when the first contact of a gesture lands, with its timestamp. */
  onTouchDown: ((time: number) => void) | null = null;
  /** The pointer of the gesture's first contact. */
  pointerType: PointerKind = 'touch';
  /** Set when the gesture is a trackpad's scroll rather than a contact. */
  scrollType: GestureTouch['scrollType'] | null = null;

  constructor(options: PanGestureRecognizerOptions = {}) {
    super({
      name: 'RefreshPull',
      direction: 'vertical',
      maximumNumberOfTouches: 1,
      ...options,
    });
  }

  /** Native scrolling keeps the finger: the pull only reads it. */
  override get claimsTouches(): boolean {
    return false;
  }

  protected override touchesBegan(
    touches: ReadonlyArray<GestureTouch>,
    event: GestureEventContext,
  ): void {
    if (this.numberOfTouches === touches.length) {
      this.pointerType = touches[0]?.pointerType ?? 'touch';
      this.scrollType = touches[0]?.scrollType ?? null;
      this.onTouchDown?.(event.time);
    }
    super.touchesBegan(touches, event);
  }
}
