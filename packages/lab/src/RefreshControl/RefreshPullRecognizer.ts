// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RefreshPullRecognizer.ts
 * @input Touches from the gesture arena
 *   (@astryxdesign/core/gestures/experimental)
 * @output Exports RefreshPullRecognizer: the downward pan that reads a pull
 *   to refresh without taking the touch from the browser
 * @position The gesture of RefreshControl, on the foundation's
 *   PanGestureRecognizer
 *
 * UIKit's refresh pull is the scroll view's own drag, not a second gesture:
 * pulling past the top reveals the control, and pushing back keeps scrolling
 * the same content in the same gesture. So this pan never claims its touch.
 * The browser keeps the finger for native scrolling, and the pan reads the
 * finger to draw the overscroll (the scroll owner's `overscroll-behavior-y`
 * is `none` near the top, so the browser itself has nothing to draw there):
 *
 * - it begins once the finger pulls down past the pan's hysteresis while
 *   nothing under it can scroll that way (`scrollEdge`), or, when the drag
 *   began as a scroll, once the content runs out (`scrollHandoff`);
 * - when the browser takes the touch to scroll, a pull already under way
 *   keeps reading it instead of being cancelled;
 * - one finger: a second finger is the browser's (pinch-zoom).
 *
 * `onTouchDown` reports a first finger landing, so a settle in flight can
 * stop where it is (UIScrollView brakes on touch-down).
 *
 * SYNC: When modified, update:
 * - /packages/lab/src/RefreshControl/useRefreshControl.ts
 */

import {
  PanGestureRecognizer,
  type GestureEventContext,
  type GestureTouch,
  type PanGestureRecognizerOptions,
} from '@astryxdesign/core/gestures/experimental';

export class RefreshPullRecognizer extends PanGestureRecognizer {
  /** Called when the first finger of a gesture lands, with its timestamp. */
  onTouchDown: ((time: number) => void) | null = null;

  constructor(options: PanGestureRecognizerOptions = {}) {
    super({
      name: 'RefreshPull',
      direction: 'down',
      scrollEdge: true,
      scrollHandoff: true,
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
      this.onTouchDown?.(event.time);
    }
    super.touchesBegan(touches, event);
  }

  protected override touchesTakenByBrowser(
    touches: ReadonlyArray<GestureTouch>,
    event: GestureEventContext,
  ): boolean {
    if (this.state === 'began' || this.state === 'changed') {
      return true;
    }
    return super.touchesTakenByBrowser(touches, event);
  }
}
