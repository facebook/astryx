// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PressTracker.ts
 * @input Touches the arena delivers to a pressable view (TouchConsumer)
 * @output Exports PressTracker (UIControl's touch tracking), its options and
 *   the control event type
 * @position View-level consumer of packages/core/src/gestures: what a
 *   UIControl does with the touches no gesture recognizer took. It paints
 *   nothing: the press feedback (utils/pressFeedback.ts) paints every
 *   pressable surface, a press-tracked control included.
 *
 * UIControl semantics, event for event:
 *
 * - `touchDown` when the finger lands.
 * - `touchDragInside` / `touchDragOutside` on every move, `touchDragExit` /
 *   `touchDragEnter` when the finger crosses the control's bounds EXPANDED
 *   by `trackingExpansion` (a fingertip dragged a little off a button is
 *   still on it).
 * - `touchUpInside` / `touchUpOutside` at the lift.
 * - `touchCancel` when a recognizer took the touch (`cancelsTouchesInView`),
 *   the browser took it to scroll, or the finger travelled past
 *   `cancelTravel` (a cell whose scroll view took the touch).
 *
 * A continuous-tracking control created with `keepsTouch: true` (a held
 * stepper) keeps its touch once its press is delivered: at once, or inside
 * a scroller after UIScrollView's content-touch delay
 * (`delaysContentTouches`), unless the finger travelled past the slop first,
 * so a flick that starts on it still scrolls.
 *
 * And UIControl's iOS 6 rule: a single-finger single tap recognizer on an
 * ANCESTOR does not beat the control's own action for a touch on it (the
 * default veto; `vetoesAncestorRecognizer` replaces it, as a slider vetoes a
 * pan along its track).
 *
 * The bounds are read once, when the finger lands; nothing reads layout
 * during the press. Activation stays the browser's click, which the arena
 * swallows for a touch a recognizer took.
 */

import {UIKIT_GESTURES} from '../motion/uikit/gestures';
import {travel} from './geometry';
import type {GestureRecognizer} from './GestureRecognizer';
import {internals} from './recognizerInternals';
import type {TapGestureRecognizer} from './TapGestureRecognizer';
import type {GestureTouch, TouchConsumer} from './types';

export type ControlEvent =
  | 'touchDown'
  | 'touchDragInside'
  | 'touchDragOutside'
  | 'touchDragEnter'
  | 'touchDragExit'
  | 'touchUpInside'
  | 'touchUpOutside'
  | 'touchCancel';

export interface PressBounds {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

export interface PressTrackerOptions {
  /** The control's bounds in client px, read when a finger lands. */
  getBounds: () => PressBounds | null;
  /** The view the tracker belongs to; recognizers on it are not ancestors. */
  view?: unknown;
  onControlEvent?: (event: ControlEvent, touch: GestureTouch) => void;
  /**
   * A continuous-tracking control (a held stepper) keeps its touch once its
   * press is delivered (at once, or inside a scroller after the content-touch
   * delay): the host cancels the browser's pan for that finger, as UIKit's
   * `touchesShouldCancel(in:)` is false for a tracking control.
   * Its element then gets a blocking `touchmove` listener, so a scroll that
   * starts on it waits on the main thread: never set it on plain buttons,
   * links, cards or list cells.
   * @default false
   */
  keepsTouch?: boolean;
  trackingExpansion?: number;
  /**
   * Travel (px) past which the press is cancelled for good (a cell whose
   * scroll view took the touch). Unset, the finger is tracked in and out of
   * the expanded bounds.
   */
  cancelTravel?: number;
  /** Which ancestor recognizers the control's own action beats. */
  vetoesAncestorRecognizer?: (recognizer: GestureRecognizer) => boolean;
  /** @default () => true */
  isEnabled?: () => boolean;
  /**
   * Whether this touch is braking a scroll the finger set moving (see
   * GestureHost.isScrollBraking): a native list highlights nothing for one,
   * and the control does not track it at all.
   */
  isBraking?: (touch: GestureTouch) => boolean;
}

const PRESS = UIKIT_GESTURES.press;

/**
 * UIButton's rule: an ancestor's single-finger single tap. The tap is told
 * apart by its family rather than its class, so press tracking never ships
 * TapGestureRecognizer.
 */
function vetoesSingleTap(recognizer: GestureRecognizer): boolean {
  if (internals(recognizer).family !== 'tap') {
    return false;
  }
  const tap = recognizer as TapGestureRecognizer;
  return tap.numberOfTapsRequired === 1 && tap.numberOfTouchesRequired === 1;
}

export class PressTracker implements TouchConsumer {
  private isKept = false;
  isTracking = false;
  isTouchInside = false;
  trackingExpansion: number;

  private readonly options: PressTrackerOptions;
  private touchId: number | null = null;
  private bounds: PressBounds | null = null;
  /** A keepsTouch control's delivery, waiting the content-touch delay. */
  private deliveryTimer: ReturnType<typeof setTimeout> | null = null;
  /** A pending delivery whose finger travelled: the scroll keeps the touch. */
  private isDeliveryDead = false;

  constructor(options: PressTrackerOptions) {
    if (options.keepsTouch === true) {
      this.keepsTouch = () => this.isKept;
    }
    this.options = options;
    this.trackingExpansion =
      options.trackingExpansion ??
      UIKIT_GESTURES.control.trackingExpansion.value;
  }

  touchBegan(touch: GestureTouch): void {
    if (
      this.touchId != null ||
      this.options.isEnabled?.() === false ||
      this.options.isBraking?.(touch) === true
    ) {
      return;
    }
    this.touchId = touch.id;
    this.bounds = this.options.getBounds();
    this.isTracking = true;
    this.isTouchInside = true;
    this.isDeliveryDead = false;
    this.emit('touchDown', touch);
    if (this.options.keepsTouch !== true) {
      return;
    }
    if (
      touch.pointerType === 'touch' &&
      touch.scroll?.isInsideScroller === true
    ) {
      // UIScrollView.delaysContentTouches: the press reaches the control
      // once the scroll view knows the finger is not scrolling.
      this.deliveryTimer = setTimeout(() => {
        this.deliveryTimer = null;
        this.deliver();
      }, PRESS.contentTouchDelay.value);
    } else {
      this.deliver();
    }
  }

  touchMoved(touch: GestureTouch): void {
    if (touch.id !== this.touchId) {
      return;
    }
    const cancelTravel = this.options.cancelTravel;
    if (cancelTravel != null && travel(touch) > cancelTravel) {
      // A cell's scroll view took the touch: the press is over.
      this.touchCancelled(touch);
      return;
    }
    if (this.deliveryTimer != null && travel(touch) > PRESS.slop.value) {
      // A finger travelling before the delay ran out is scrolling: the
      // press is never delivered, and the scroll keeps the touch.
      this.clearDeliveryTimer();
      this.isDeliveryDead = true;
    }
    const inside = this.contains(touch);
    if (inside !== this.isTouchInside) {
      this.isTouchInside = inside;
      this.emit(inside ? 'touchDragEnter' : 'touchDragExit', touch);
      this.deliver();
    }
    this.emit(inside ? 'touchDragInside' : 'touchDragOutside', touch);
  }

  touchEnded(touch: GestureTouch): void {
    if (touch.id !== this.touchId) {
      return;
    }
    this.isKept = false;
    this.clearDeliveryTimer();
    this.emit(this.contains(touch) ? 'touchUpInside' : 'touchUpOutside', touch);
    this.finish();
  }

  touchCancelled(touch: GestureTouch): void {
    if (touch.id !== this.touchId) {
      return;
    }
    this.isKept = false;
    this.clearDeliveryTimer();
    this.emit('touchCancel', touch);
    this.finish();
  }

  allowsAncestorRecognizer(recognizer: unknown): boolean {
    const candidate = recognizer as GestureRecognizer;
    if (candidate.view != null && candidate.view === this.options.view) {
      return true;
    }
    const vetoes = this.options.vetoesAncestorRecognizer ?? vetoesSingleTap;
    return !vetoes(candidate);
  }

  /** End any press, calling nothing back (the control unmounted). */
  dispose(): void {
    this.isKept = false;
    this.clearDeliveryTimer();
    this.finish();
  }

  private contains(touch: GestureTouch): boolean {
    const bounds = this.bounds;
    if (bounds == null) {
      return true;
    }
    const margin = this.trackingExpansion;
    return (
      touch.x >= bounds.left - margin &&
      touch.x <= bounds.right + margin &&
      touch.y >= bounds.top - margin &&
      touch.y <= bounds.bottom + margin
    );
  }

  private emit(event: ControlEvent, touch: GestureTouch): void {
    this.options.onControlEvent?.(event, touch);
  }

  /**
   * A keepsTouch control's press is delivered once no delay is pending, the
   * finger has not scrolled, and it is inside: the control keeps the touch
   * until it ends.
   */
  private deliver(): void {
    if (
      this.options.keepsTouch === true &&
      this.deliveryTimer == null &&
      !this.isDeliveryDead &&
      this.isTouchInside
    ) {
      this.isKept = true;
    }
  }

  /**
   * Present only for a continuous-tracking control created with
   * `keepsTouch: true` (a held stepper): once its press is delivered, the
   * browser's pan must not take the touch. A plain pressable leaves it
   * undefined and keeps passive listeners, so a scroll starting on it never
   * waits on the main thread.
   */
  readonly keepsTouch?: () => boolean;

  private clearDeliveryTimer(): void {
    if (this.deliveryTimer != null) {
      clearTimeout(this.deliveryTimer);
      this.deliveryTimer = null;
    }
  }

  private finish(): void {
    this.touchId = null;
    this.isTracking = false;
    this.isTouchInside = false;
    this.bounds = null;
  }
}
