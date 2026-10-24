// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file menuSelectionRecognizer.ts
 * @input F2's GestureRecognizer base, UIKit's press clocks (content-touch
 *   delay, press slop) from the constants table
 * @output Exports MenuSelectionGestureRecognizer: the finger's selection
 *   gesture inside an open menu, as UIMenu's list tracks it
 * @position Internal recognizer of useMenuPress's touch tracking; it drives
 *   the shared action-group tracker (actionGroupTracker.ts)
 *
 * UIMenu's rows live in a scroll view that delays content touches, so a
 * finger that lands in a menu behaves as measured on the iOS 26.2 simulator
 * (a 3-row and a 30-row menu from a pull-down button):
 *
 * - held still, the row under it highlights after the content-touch delay
 *   (about 160 ms), in a short menu as in a long one;
 * - lifted before that (a tap), the row under it highlights and acts at the
 *   lift;
 * - travelling past the press slop before that: in a menu that scrolls, the
 *   list scrolls and nothing highlights or acts; in a menu that fits, the
 *   press begins at once from where it landed and the highlight follows the
 *   finger;
 * - once begun, the highlight follows the finger until the lift, which acts
 *   on the row under it.
 *
 * The recognizer begins, changes and ends like any continuous recognizer; a
 * tap is recognized at the lift (possible to ended), so the owner begins and
 * ends the tracking in that one event. In a menu that scrolls it does not
 * claim the finger: a drag after the highlight came on still scrolls the
 * list, and the browser's taking the finger cancels the press, as in UIKit.
 *
 * SYNC: When modified, update menuSelectionRecognizer.test.ts and
 * useMenuPress.ts
 */

import {travel} from '../gestures/geometry';
import {
  GestureRecognizer,
  isActive,
  type GestureRecognizerOptions,
} from '../gestures/GestureRecognizer';
import type {GestureEventContext, GestureTouch, Point} from '../gestures/types';
import {UIKIT_GESTURES} from '../motion/uikit/gestures';

export interface MenuSelectionGestureRecognizerOptions extends GestureRecognizerOptions<MenuSelectionGestureRecognizer> {
  /**
   * Whether the menu scrolls: a finger that travels before the onset then
   * scrolls it, and the recognizer leaves the finger to the browser.
   */
  scrolls: () => boolean;
  /** @default the content-touch delay (UIKIT_GESTURES.press) */
  onsetMs?: number;
  /** @default the press slop (UIKIT_GESTURES.press) */
  slop?: number;
}

export class MenuSelectionGestureRecognizer extends GestureRecognizer {
  onsetMs: number;
  slop: number;
  private readonly scrolls: () => boolean;
  private landing: Point | null = null;
  private secondTouch = false;

  constructor(options: MenuSelectionGestureRecognizerOptions) {
    super({
      allowedPointerTypes: ['touch', 'pen'],
      ...options,
    });
    this.scrolls = options.scrolls;
    this.onsetMs =
      options.onsetMs ?? UIKIT_GESTURES.press.contentTouchDelay.value;
    this.slop = options.slop ?? UIKIT_GESTURES.press.slop.value;
  }

  /**
   * Whether a second finger ended this press: the browser may still report
   * a click for the first, which nothing may act on.
   */
  get endedByAnotherFinger(): boolean {
    return this.secondTouch;
  }

  /** Where the finger landed: the press tracks from there. */
  landingLocation(): Point {
    return this.landing ?? this.location();
  }

  /**
   * A menu that scrolls leaves the finger to the browser even once the press
   * has begun, so a drag still scrolls it (and cancels the press).
   */
  override get claimsTouches(): boolean {
    return !this.scrolls();
  }

  protected override acceptsTouch(touch: GestureTouch): boolean {
    if (this.numberOfTouches >= 1) {
      // A second finger ends the press with nothing acting
      // (module:DropdownMenu/useMenuPress FR4). The touch itself is not
      // taken, so the pinch it may start stays the browser's.
      this.secondTouch = true;
      this.clearTimer();
      if (isActive(this.state)) {
        this.setState('cancelled');
      } else if (this.state === 'possible') {
        this.setState('failed');
      }
      return false;
    }
    return super.acceptsTouch(touch);
  }

  protected override touchesBegan(
    touches: ReadonlyArray<GestureTouch>,
    event: GestureEventContext,
  ): void {
    const [touch] = touches;
    this.landing = {x: touch.startX, y: touch.startY};
    this.setTimer(event.time + this.onsetMs, () => {
      if (this.state === 'possible' && this.numberOfTouches === 1) {
        this.setState('began');
      }
    });
  }

  protected override touchesMoved(touches: ReadonlyArray<GestureTouch>): void {
    if (this.state === 'possible') {
      if (!touches.some(touch => travel(touch) > this.slop)) {
        return;
      }
      this.clearTimer();
      // A menu that scrolls takes the travelling finger for a scroll; one
      // that fits delivers the press at once.
      this.setState(this.scrolls() ? 'failed' : 'began');
      return;
    }
    if (isActive(this.state)) {
      this.setState('changed');
    }
  }

  protected override touchesEnded(): void {
    this.clearTimer();
    // Active: the lift ends the press. Still possible: a tap, recognized at
    // the lift.
    if (isActive(this.state) || this.state === 'possible') {
      this.setState('ended');
    }
  }

  protected override reset(): void {
    this.landing = null;
    this.secondTouch = false;
  }
}
