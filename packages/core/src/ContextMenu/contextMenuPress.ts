// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file contextMenuPress.ts
 * @input Touches from the gesture arena; the context-menu constants; the
 *   touch idiom
 * @output Exports ContextMenuPressRecognizer: the long press that opens a
 *   context menu on UIContextMenuInteraction's timeline (feedback, commit,
 *   menu) in the iOS idiom, or on today's long press (the menu at 500 ms)
 *   outside it, and the press it reports
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
 * Outside the iOS idiom (Android, any finger off iOS WebKit) it keeps today's
 * long press: it begins at 500 ms with the menu due at once, and 10 px of
 * travel on either axis fails it first (useLongPress's values). The claim,
 * the suppressed click and the second-finger rule are the same everywhere.
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
import type {TouchIdiom} from '../utils/touchPresentation';

/**
 * When a press claims the finger, when its menu shows, and how far the finger
 * may travel on either axis before that (px).
 */
interface PressTimeline {
  readonly commitMs: number;
  readonly menuDisplayMs: number;
  readonly allowableMovement: number;
}

/**
 * iOS 26's timeline (measured), and today's long press for every other
 * finger: useLongPress's 500 ms and 10 px, with the menu at the commit.
 */
const TIMELINES: Readonly<Record<TouchIdiom, PressTimeline>> = {
  ios: {
    commitMs: contextMenu.press.commitMs,
    menuDisplayMs: contextMenu.press.menuDisplayMs,
    allowableMovement: contextMenu.press.allowableMovement,
  },
  default: {commitMs: 500, menuDisplayMs: 500, allowableMovement: 10},
};

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
  /**
   * Whose timeline a press follows, read as each finger lands: iOS 26's (the
   * default), or today's long press. A function follows a changing idiom.
   */
  idiom?: TouchIdiom | (() => TouchIdiom);
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
  private timeline: PressTimeline;
  private readonly readIdiom: () => TouchIdiom;

  constructor(options: ContextMenuPressRecognizerOptions = {}) {
    const {idiom = 'ios', onPressStart, ...rest} = options;
    const readIdiom = typeof idiom === 'function' ? idiom : () => idiom;
    super({
      ...rest,
      // A finger or a pen; a mouse opens the menu with its secondary button.
      allowedPointerTypes: options.allowedPointerTypes ?? ['touch', 'pen'],
      minimumPressDuration: TIMELINES[readIdiom()].commitMs,
      // The drift rule is per axis (touchesMoved below), not a distance.
      allowableMovement: Infinity,
    });
    this.onPressStart = onPressStart;
    this.readIdiom = readIdiom;
    this.timeline = TIMELINES[readIdiom()];
    // At the commit, arm the display deadline: a finger still down then
    // gets the menu.
    this.addTransitionListener((_recognizer, _from, to) => {
      if (to !== 'began' || this.press == null) {
        return;
      }
      this.setTimer(this.press.time + this.timeline.menuDisplayMs, () => {
        if (isActive(this.state)) {
          this.isMenuDue = true;
          this.setState('changed');
        }
      });
    });
  }

  /** Whose timeline the press in play (or the next one) follows. */
  get idiom(): TouchIdiom {
    return this.timeline === TIMELINES.ios ? 'ios' : 'default';
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
    // The idiom is read as a press starts (the server's until hydrated; a
    // pointer change can switch it), before the commit timer is set.
    if (this.press == null && this.state === 'possible') {
      this.timeline = TIMELINES[this.readIdiom()];
      this.minimumPressDuration = this.timeline.commitMs;
    }
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
    const limit = this.timeline.allowableMovement;
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
