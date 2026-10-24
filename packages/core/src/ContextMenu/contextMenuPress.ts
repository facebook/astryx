// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file contextMenuPress.ts
 * @input Touches from the gesture arena; the context-menu constants
 * @output Exports ContextMenuPressRecognizer: the long press that opens a
 *   context menu on UIContextMenuInteraction's timeline (feedback, commit,
 *   menu), and the press it reports
 * @position ContextMenu's touch invocation, on the gesture foundation
 *   (../gestures); ContextMenu.tsx attaches it to the trigger
 *
 * A context menu is not UIKit's plain long press (500 ms, 10 pt of travel).
 * Its timeline (contextMenu.press), as the states of this recognizer:
 * - `possible`: the finger landed (`onPressStart`); the press feedback
 *   shows from `feedbackOnsetMs`. A lift, a second finger, the browser
 *   taking the touch to scroll, or a drift past `allowableMovement` on
 *   either axis: `failed`.
 * - `began` at `commitMs`: the click haptic. The recognizer claims the
 *   touch (the page stops scrolling under it, and the lift sends no click
 *   and no compatibility mouse events). The menu is not shown yet; a drift
 *   past `allowableMovement` still ends it with no menu (`cancelled`), and
 *   a lift shows it at once (`ended` without `isMenuDue`).
 * - `changed` with `isMenuDue` at `menuDisplayMs`: the finger is still
 *   down and the menu shows. From then on the finger moves freely.
 *
 * It is a LongPressGestureRecognizer whose duration is the commit, so the
 * foundation gives it the begin time (exact under a blocked main thread),
 * the claim and the failure rules; it adds the drift rule, the display
 * deadline and the moment a finger lands, reported with its time on the
 * event clock so the press feedback can be placed on the compositor's
 * timeline from the touch itself rather than from whenever JavaScript gets
 * to run. A press that fails or is cancelled reports it through
 * `addTransitionListener`, while `press` still names it.
 *
 * SYNC: When modified, update /packages/core/src/ContextMenu/ContextMenu.tsx
 * and /packages/core/src/ContextMenu/contextMenuPress.test.ts
 */

import {
  isActive,
  LongPressGestureRecognizer,
  type GestureEventContext,
  type GestureTouch,
  type LongPressGestureRecognizerOptions,
} from '../gestures';
import {contextMenu} from '../motion/uikit';

/** A finger that may become a context menu: when and where it landed. */
export interface ContextMenuPress {
  /** On the event clock (`performance.now()`, an event's `timeStamp`), ms. */
  readonly time: number;
  /** Client CSS px. */
  readonly x: number;
  readonly y: number;
}

export interface ContextMenuPressRecognizerOptions extends Omit<
  LongPressGestureRecognizerOptions,
  | 'allowableMovement'
  | 'minimumPressDuration'
  | 'numberOfTapsRequired'
  | 'numberOfTouchesRequired'
> {
  /** A finger landed and may become a context menu. */
  onPressStart?: (recognizer: ContextMenuPressRecognizer) => void;
}

export class ContextMenuPressRecognizer extends LongPressGestureRecognizer {
  /** The finger in play, from its landing until the gesture resets. */
  press: ContextMenuPress | null = null;
  /**
   * The finger stayed until `menuDisplayMs`: the menu is due, and the finger
   * moves freely from here.
   */
  isMenuDue = false;
  private readonly onPressStart:
    ((recognizer: ContextMenuPressRecognizer) => void) | undefined;

  constructor(options: ContextMenuPressRecognizerOptions = {}) {
    super({
      ...options,
      // A finger or a pen; a mouse opens the menu with its secondary button.
      allowedPointerTypes: options.allowedPointerTypes ?? ['touch', 'pen'],
      minimumPressDuration: contextMenu.press.commitMs,
      // The drift rule is per axis (touchesMoved below), not a distance.
      allowableMovement: Infinity,
    });
    this.onPressStart = options.onPressStart;
    // At the commit, arm the display deadline: a finger still down then
    // gets the menu.
    this.addTransitionListener((_recognizer, _from, to) => {
      if (to !== 'began' || this.press == null) {
        return;
      }
      this.setTimer(this.press.time + contextMenu.press.menuDisplayMs, () => {
        if (isActive(this.state)) {
          this.isMenuDue = true;
          this.setState('changed');
        }
      });
    });
  }

  /**
   * The event clock at this moment: the timestamp of the input (or the
   * deadline of the timer) being processed. Read it from a listener to
   * place what the transition starts at the time it happened.
   */
  get clockTime(): number {
    return this.now();
  }

  protected override touchesBegan(
    touches: ReadonlyArray<GestureTouch>,
    event: GestureEventContext,
  ): void {
    super.touchesBegan(touches, event);
    if (
      this.press == null &&
      this.state === 'possible' &&
      this.numberOfTouches === this.numberOfTouchesRequired
    ) {
      const [touch] = touches;
      this.press = {time: event.time, x: touch.x, y: touch.y};
      this.onPressStart?.(this);
    }
  }

  protected override touchesMoved(touches: ReadonlyArray<GestureTouch>): void {
    const limit = contextMenu.press.allowableMovement;
    const hasDrifted = touches.some(
      touch =>
        Math.abs(touch.x - touch.startX) > limit ||
        Math.abs(touch.y - touch.startY) > limit,
    );
    if (hasDrifted && this.state === 'possible') {
      this.setState('failed');
      return;
    }
    if (hasDrifted && isActive(this.state) && !this.isMenuDue) {
      this.setState('cancelled');
      return;
    }
    super.touchesMoved(touches);
  }

  protected override reset(): void {
    super.reset();
    this.press = null;
    this.isMenuDue = false;
  }
}
