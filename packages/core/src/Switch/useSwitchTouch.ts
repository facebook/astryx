// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSwitchTouch.ts
 * @input Switch's parts (gesture surface, input, thumb, fill, glass and the
 *   track's on layer), its value, whether it is interactive, and the thumb
 *   geometry (switchTouch.ts)
 * @output Exports useSwitchTouch: Switch's touch presentation. A finger lifts
 *   the thumb into a glass lens; a drag moves it with a rubber band and flips
 *   the switch; a release commits; every motion runs on the compositor
 * @position DOM half of Switch's touch presentation, on the gesture system
 *   (../gestures) and the compositor animator (../motion/animator). Active
 *   only under a coarse pointer; the desktop presentation is untouched
 *
 * UISwitch on iOS 26.2 is the reference; every number is in
 * motion/uikit/switch.ts. How it maps onto the web:
 *
 * - The thumb's resting place is CSS (its inline-start inset), so the steady
 *   state needs no script and mirrors under RTL by itself. The animator only
 *   ever moves the thumb by a delta from that place (`translate`), and when
 *   the value changes and the CSS place jumps, the delta is rebased in the
 *   same layout effect, so nothing moves on screen and the velocity is kept.
 * - Touches go to the gesture system, in one of two ways chosen by the
 *   switch-point in switchTouchClaim.ts:
 *   - Claiming (UISwitch, the default): its own recognizers, a long press
 *     that begins on the touch (after a scroll view's content delay inside
 *     one) and then owns it, a horizontal pan, and a release tap with no
 *     movement or time limit. A held switch keeps the touch, so a vertical
 *     drag after the hold does not scroll and the lift toggles; a scroll
 *     that starts on the switch waits for a busy main thread, as UIKit's
 *     own scroll view would.
 *   - Passive: a PressTracker, UIControl's tracking, which never blocks a
 *     scroll. The thumb lifts with the press or once a horizontal move
 *     would begin a pan; `touch-action: pan-y` (Switch.tsx) keeps
 *     horizontal moves for the switch, so a drag follows and flips it, and
 *     the lift commits. A vertical drag, even after a hold, is the page's
 *     scroll: the browser takes the touch and the switch yields.
 *   Either way the browser's own click is cancelled (by the recognizers,
 *   or by cancelling the release's `touchend`) and the switch clicks its
 *   input itself, so forms, `onChange` and keyboard activation stay the
 *   native checkbox's.
 * - The drag never renders: each move retargets the thumb's tracking spring
 *   (one style write) and steps the flip rule on the finger's travel; the
 *   thumb's position comes from its curve, never from layout.
 * - The lift and the settle are played as one curve built at the release
 *   (the lift spring until the settle may start, then the settle spring from
 *   that state), so the settle starts on time on the compositor even if the
 *   main thread is busy.
 * - Reduce Motion changes nothing here: UISwitch keeps its lift and springs
 *   (it drops only the lens's squash and stretch, which this does not draw).
 *
 * SYNC: When modified, update switchTouch.ts, switchTouchClaim.ts, Switch.tsx
 * and __tests__/Switch.interaction.browser.spec.ts.
 */

import {useState, type RefObject} from 'react';
import {getGestureHost} from '../gestures/GestureHost';
import {isActive, type GestureRecognizer} from '../gestures/GestureRecognizer';
import {LongPressGestureRecognizer} from '../gestures/LongPressGestureRecognizer';
import {PanGestureRecognizer} from '../gestures/PanGestureRecognizer';
import {PressTracker, type ControlEvent} from '../gestures/PressTracker';
import {TapGestureRecognizer} from '../gestures/TapGestureRecognizer';
import type {GestureTouch} from '../gestures/types';
import {isRtlElement} from '../hooks/isRtlElement';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {
  createAnimator,
  type Animator,
  type MotionCurve,
} from '../motion/animator';
import {solveSpring, toSpring} from '../motion/spring';
import {UIKIT_GESTURES} from '../motion/uikit/gestures';
import {switchControl} from '../motion/uikit/switch';
import {useTouchPresentation} from '../utils/touchPresentation';
import {
  commitOnRelease,
  dragTarget,
  settleTime,
  startFlip,
  stepFlip,
  type SwitchFlip,
  type SwitchTouchGeometry,
} from './switchTouch';
import {SWITCH_CLAIMS_HELD_TOUCH} from './switchTouchClaim';

export interface SwitchTouchParts {
  /** Receives the touches: the input and the track. */
  readonly surface: RefObject<HTMLElement | null>;
  readonly input: RefObject<HTMLInputElement | null>;
  /** Moves and lifts: the thumb's box. */
  readonly thumb: RefObject<HTMLElement | null>;
  /** The thumb's opaque fill (the themed thumb). */
  readonly fill: RefObject<HTMLElement | null>;
  /** The clear lens shown while lifted. */
  readonly glass: RefObject<HTMLElement | null>;
  /** The track's on color. */
  readonly on: RefObject<HTMLElement | null>;
}

export interface SwitchTouchOptions {
  readonly isOn: boolean;
  /** False while disabled or busy: no touch is tracked. */
  readonly isInteractive: boolean;
  readonly geometry: SwitchTouchGeometry;
}

const LIFT = toSpring(switchControl.lift);
const SETTLE = toSpring(switchControl.settle);
const TRAVEL = switchControl.travel;
const TRACKING = switchControl.tracking;
/** UIScrollView's content-touch delay: the press waits for it in a scroller. */
const PRESS_DELAY = UIKIT_GESTURES.press.contentTouchDelay.value;
const TOUCH_TYPES = ['touch', 'pen'] as const;
/**
 * Passive: horizontal travel at which the thumb lifts if the press has not
 * (a pan begins here), px.
 */
const PAN_HYSTERESIS = UIKIT_GESTURES.pan.hysteresis.value;
/**
 * Passive: how long after the switch's own release the browser's trusted
 * click is swallowed, ms (it follows the lift within a frame or two).
 */
const CLICK_GUARD_MS = 1000;
/**
 * How long the text-selection guard outlives a held press: iOS Safari
 * re-applies its long-press selection on the lift (seen within 15 ms on the
 * iOS 26.2 simulator).
 */
const SELECTION_GUARD_AFTER_LIFT_MS = 500;

function now(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

/**
 * The lift spring until `holdSeconds`, then the settle spring from wherever
 * the lift had got to: one curve, so the settle starts on the compositor's
 * clock.
 */
function liftThenSettle({
  from,
  velocity,
  lifted,
  rest,
  holdSeconds,
  threshold,
}: {
  from: number;
  velocity: number;
  lifted: number;
  rest: number;
  holdSeconds: number;
  threshold: number;
}): MotionCurve {
  const hold = Math.max(0, holdSeconds);
  const first = solveSpring(LIFT, {from, to: lifted, velocity});
  const second = solveSpring(SETTLE, {
    from: first.value(hold),
    to: rest,
    velocity: first.velocity(hold),
  });
  return {
    duration: hold + second.settleTime(threshold),
    at: t => (t < hold ? first.value(t) : second.value(t - hold)),
    velocity: t => (t < hold ? first.velocity(t) : second.velocity(t - hold)),
  };
}

function latestTime(recognizer: GestureRecognizer): number {
  let time = Number.NEGATIVE_INFINITY;
  for (const touch of recognizer.trackedTouches) {
    time = Math.max(time, touch.time);
  }
  return Number.isFinite(time) ? time : now();
}

/** The finger's travel along x since it landed, or null once it lifted. */
function travelX(recognizer: GestureRecognizer): number | null {
  if (recognizer instanceof PanGestureRecognizer) {
    return recognizer.totalTranslation().x;
  }
  const touch = recognizer.trackedTouches[0];
  return touch == null ? null : touch.x - touch.startX;
}

interface Elements {
  surface: HTMLElement;
  input: HTMLInputElement;
  thumb: HTMLElement;
  fill: HTMLElement;
  glass: HTMLElement;
  on: HTMLElement;
}

interface Drag {
  /** The thumb's offset when the finger landed. */
  readonly start: number;
  flip: SwitchFlip;
}

/**
 * The touch presentation of one switch: animators, recognizers and the
 * gesture state. No React state: a gesture never renders.
 */
export class SwitchTouchController {
  private elements: Elements | null = null;
  private geometry: SwitchTouchGeometry;
  private isOn: boolean;
  private isInteractive = true;
  /** The side the visuals show or head to. */
  private isVisuallyOn: boolean;
  /** +1 left-to-right, −1 right-to-left. */
  private direction = 1;
  private thumb: Animator | null = null;
  private fill: Animator | null = null;
  private glass: Animator | null = null;
  private on: Animator | null = null;
  private press: LongPressGestureRecognizer | null = null;
  private pan: PanGestureRecognizer | null = null;
  private tap: TapGestureRecognizer | null = null;
  private detachers: (() => void)[] = [];
  /** When the thumb lifted (document timeline, ms); null while at rest. */
  private liftTime: number | null = null;
  /** The thumb's offset when the current finger landed. */
  private downOffset = 0;
  private drag: Drag | null = null;
  /** The finger's last travel along x, for a lift that reports none. */
  private lastTravel = 0;
  /**
   * The press and the pan both report every touch event; the first report
   * takes the step and this skips the second (cleared after the event).
   */
  private isStepping = false;
  /** The current touch already ended in a release. */
  private released = false;
  /** Passive: a finger is down on the switch. */
  private isTracking = false;
  /** Passive: until when the browser's next trusted click is swallowed. */
  private clickGuardUntil = 0;
  /** Passive: the switch released on this touch; its `touchend` is cancelled. */
  private cancelsTouchEnd = false;
  /** Removes the document's text-selection block (see guardSelection). */
  private unguardSelection: (() => void) | null = null;
  private selectionTimer: ReturnType<typeof setTimeout> | null = null;
  private reconcileTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(isOn: boolean, geometry: SwitchTouchGeometry) {
    this.isOn = isOn;
    this.isVisuallyOn = isOn;
    this.geometry = geometry;
  }

  get isAttached(): boolean {
    return this.elements != null;
  }

  attach(elements: Elements): void {
    this.detach();
    this.elements = elements;
    this.direction = isRtlElement(elements.surface) ? -1 : 1;
    this.isVisuallyOn = this.isOn;
    this.thumb = createAnimator(elements.thumb);
    this.fill = createAnimator(elements.fill);
    this.glass = createAnimator(elements.glass, {initial: {opacity: 0}});
    this.on = createAnimator(elements.on, {
      initial: {opacity: this.isOn ? 1 : 0},
    });

    const host = getGestureHost(elements.surface.ownerDocument);
    this.detachers = SWITCH_CLAIMS_HELD_TOUCH
      ? this.attachClaiming(host, elements)
      : this.attachPassive(host, elements);
  }

  /**
   * Claiming (UISwitch): a long press that begins on the touch (after the
   * content delay inside a scroller) and owns it from then on; a horizontal
   * pan for a drag that starts before the press begins; a tap with no limits
   * for a release before the press begins.
   */
  private attachClaiming(
    host: ReturnType<typeof getGestureHost>,
    elements: Elements,
  ): (() => void)[] {
    const isBraking = () => host.isScrollBraking(elements.surface);
    const press = new LongPressGestureRecognizer({
      name: 'switch-press',
      minimumPressDuration: 0,
      allowedPointerTypes: TOUCH_TYPES,
      shouldReceiveTouch: (recognizer, touch) => {
        if (isBraking()) {
          return false;
        }
        if (recognizer.numberOfTouches === 0) {
          recognizer.minimumPressDuration =
            touch.pointerType === 'touch' &&
            touch.scroll?.isInsideScroller === true
              ? PRESS_DELAY
              : 0;
          this.touchDown(touch.startTime);
        }
        return true;
      },
    });
    const pan = new PanGestureRecognizer({
      name: 'switch-drag',
      direction: 'horizontal',
      maximumNumberOfTouches: 1,
      allowedPointerTypes: TOUCH_TYPES,
      shouldReceiveTouch: () => !isBraking(),
    });
    const tap = new TapGestureRecognizer({
      name: 'switch-release',
      allowableMovement: Number.POSITIVE_INFINITY,
      maximumTapDuration: Number.POSITIVE_INFINITY,
      allowedPointerTypes: TOUCH_TYPES,
      shouldReceiveTouch: () => !isBraking(),
    });
    press.recognizeSimultaneouslyWith(pan);
    pan.recognizeSimultaneouslyWith(press);
    tap.requireToFail(press);
    for (const recognizer of [press, pan, tap]) {
      recognizer.setEnabled(this.isInteractive);
    }
    this.press = press;
    this.pan = pan;
    this.tap = tap;
    return [
      host.attach(elements.surface, press),
      host.attach(elements.surface, pan),
      host.attach(elements.surface, tap),
      press.addListener(recognizer => this.onGesture(recognizer)),
      pan.addListener(recognizer => this.onGesture(recognizer)),
      tap.addListener(recognizer => {
        if (recognizer.state === 'ended') {
          this.release(latestTime(recognizer));
        }
      }),
    ];
  }

  /**
   * Passive: UIControl's tracking, which never blocks a scroll. The lift
   * comes with the press (same frame outside a scroller, after the content
   * delay inside one) or with the first horizontal move a pan would begin
   * on; every move follows and steps the flip rule; the lift commits; a
   * touch the browser takes for its scroll yields with no toggle.
   */
  private attachPassive(
    host: ReturnType<typeof getGestureHost>,
    elements: Elements,
  ): (() => void)[] {
    const {surface} = elements;
    const tracker = new PressTracker({
      view: surface,
      getBounds: () => surface.getBoundingClientRect(),
      isEnabled: () => this.isInteractive,
      isBraking: () => host.isScrollBraking(surface),
      onControlEvent: (event, touch) => this.onControlEvent(event, touch),
      onHighlightChange: isHighlighted => {
        if (isHighlighted && this.isTracking && this.liftTime == null) {
          this.lift(now());
        }
      },
    });
    // The switch has already clicked its input at its own release, so the
    // browser must not click too. Cancelling the release's `touchend` stops
    // its click and compatibility mouse events (no focus, no sticky hover),
    // as the gesture host does for a claimed touch; a `touchend` listener
    // never delays a scroll. The tracker hears the lift first (the host
    // listens on the document, in the capture phase).
    const onTouchEnd = (event: TouchEvent) => {
      if (this.cancelsTouchEnd && event.cancelable) {
        event.preventDefault();
      }
      this.cancelsTouchEnd = false;
    };
    // Where a `touchend` cannot be cancelled, the browser's trusted click is
    // swallowed instead. Keyboard and assistive-technology clicks (`detail`
    // 0) and the switch's own (untrusted) click always pass.
    const onClick = (event: MouseEvent) => {
      if (event.isTrusted && event.detail > 0 && now() < this.clickGuardUntil) {
        this.clickGuardUntil = 0;
        event.preventDefault();
        event.stopPropagation();
      }
    };
    // A held switch opens no menu (UISwitch shows none).
    const onContextMenu = (event: Event) => {
      if (this.liftTime != null) {
        event.preventDefault();
      }
    };
    const touchEndOptions = {capture: true, passive: false} as const;
    surface.addEventListener('touchend', onTouchEnd, touchEndOptions);
    surface.addEventListener('click', onClick, true);
    surface.addEventListener('contextmenu', onContextMenu);
    return [
      host.attachConsumer(surface, tracker),
      () => tracker.dispose(),
      () =>
        surface.removeEventListener('touchend', onTouchEnd, touchEndOptions),
      () => surface.removeEventListener('click', onClick, true),
      () => surface.removeEventListener('contextmenu', onContextMenu),
    ];
  }

  /** Undo everything: listeners, timers, animations and inline styles. */
  detach(): void {
    for (const detach of this.detachers) {
      detach();
    }
    this.detachers = [];
    this.releaseSelection();
    this.clearTimers();
    for (const animator of [this.thumb, this.fill, this.glass, this.on]) {
      const element = animator?.element;
      animator?.dispose();
      if (element != null) {
        for (const property of ['translate', 'scale', 'opacity']) {
          element.style.removeProperty(property);
        }
      }
    }
    this.thumb = this.fill = this.glass = this.on = null;
    this.press = this.pan = this.tap = null;
    this.elements = null;
    this.liftTime = null;
    this.drag = null;
    this.isTracking = false;
    this.clickGuardUntil = 0;
  }

  setInteractive(isInteractive: boolean): void {
    this.isInteractive = isInteractive;
    for (const recognizer of [this.press, this.pan, this.tap]) {
      recognizer?.setEnabled(isInteractive);
    }
    if (!isInteractive && this.liftTime != null) {
      this.abandon(now());
    }
  }

  setGeometry(geometry: SwitchTouchGeometry): void {
    this.geometry = geometry;
    this.thumb?.set({x: 0, scaleX: 1, scaleY: 1});
  }

  /**
   * The rendered value changed. The CSS has already moved the thumb's
   * resting place, so the thumb's delta is rebased first (nothing moves on
   * screen), then the visuals head for the new value.
   */
  setValue(isOn: boolean): void {
    if (isOn === this.isOn) {
      return;
    }
    const previous = this.isOn;
    this.isOn = isOn;
    const thumb = this.thumb;
    if (thumb == null) {
      this.isVisuallyOn = isOn;
      return;
    }
    const time = now();
    const x = thumb.get('x', time);
    const velocity = thumb.getVelocity('x', time);
    thumb.set({
      x: x + this.direction * (this.rest(previous) - this.rest(isOn)),
    });
    if (this.drag != null && !this.released) {
      // The app changed the value mid-gesture: the value wins and the
      // gesture ends without committing.
      this.drag = null;
      this.released = true;
      for (const recognizer of [this.press, this.pan]) {
        recognizer?.setEnabled(false);
        recognizer?.setEnabled(this.isInteractive);
      }
      this.settle(time);
    }
    this.showSide(isOn, time, velocity);
  }

  // --- Touches ---------------------------------------------------------------

  private touchDown(time: number): void {
    this.released = false;
    this.drag = null;
    this.lastTravel = 0;
    this.downOffset = this.offsetAt(time);
  }

  /** Passive: a finger (or pen) on the switch, UIControl's events. */
  private onControlEvent(event: ControlEvent, touch: GestureTouch): void {
    if (touch.pointerType === 'mouse') {
      // A mouse on a touch device clicks the checkbox natively.
      return;
    }
    const travel = touch.x - touch.startX;
    switch (event) {
      case 'touchDown':
        this.isTracking = true;
        this.clickGuardUntil = 0;
        this.touchDown(touch.startTime);
        return;
      case 'touchDragInside':
      case 'touchDragOutside':
        if (this.released || !this.isInteractive) {
          return;
        }
        if (this.liftTime == null) {
          if (Math.abs(travel) < PAN_HYSTERESIS) {
            return;
          }
          // A pan would begin here: the switch takes the horizontal drag.
          this.lift(touch.time);
        }
        this.move(touch.time, travel);
        return;
      case 'touchUpInside':
      case 'touchUpOutside':
        this.isTracking = false;
        if (this.released || !this.isInteractive) {
          return;
        }
        // The lift is a step of its own: a flip armed by the last move
        // happens here (a fast swipe flips on the lift).
        this.move(touch.time, travel);
        this.cancelsTouchEnd = true;
        this.clickGuardUntil = now() + CLICK_GUARD_MS;
        this.release(touch.time);
        return;
      case 'touchCancel':
        // The browser took the touch for its scroll, or a recognizer above
        // took it: the switch yields.
        this.isTracking = false;
        if (!this.released) {
          this.released = true;
          this.abandon(touch.time);
        }
        return;
      case 'touchDragEnter':
      case 'touchDragExit':
        return;
    }
  }

  /**
   * While the thumb is lifted, the page selects no text: iOS Safari's own
   * long press otherwise selects past the row (whose CSS already opts out),
   * at the nearest block boundary, with a loupe, a handle and an edit menu.
   * It fires no `selectstart` for that, and clearing the selection it makes
   * leaves its menu up, so nothing is selectable while the finger is down.
   * UISwitch selects nothing.
   */
  private guardSelection(): void {
    if (this.selectionTimer != null) {
      clearTimeout(this.selectionTimer);
      this.selectionTimer = null;
    }
    const root = this.elements?.surface.ownerDocument.documentElement;
    if (root == null || this.unguardSelection != null) {
      return;
    }
    const previous = ['-webkit-user-select', 'user-select'].map(
      property => [property, root.style.getPropertyValue(property)] as const,
    );
    for (const [property] of previous) {
      root.style.setProperty(property, 'none');
    }
    this.unguardSelection = () => {
      for (const [property, value] of previous) {
        if (value === '') {
          root.style.removeProperty(property);
        } else {
          root.style.setProperty(property, value);
        }
      }
    };
  }

  /** iOS applies its long-press selection again as the finger lifts. */
  private releaseSelectionSoon(): void {
    if (this.unguardSelection == null || this.selectionTimer != null) {
      return;
    }
    this.selectionTimer = setTimeout(
      () => this.releaseSelection(),
      SELECTION_GUARD_AFTER_LIFT_MS,
    );
  }

  private releaseSelection(): void {
    if (this.selectionTimer != null) {
      clearTimeout(this.selectionTimer);
      this.selectionTimer = null;
    }
    this.unguardSelection?.();
    this.unguardSelection = null;
  }

  private onGesture(
    recognizer: LongPressGestureRecognizer | PanGestureRecognizer,
  ): void {
    if (this.released) {
      return;
    }
    const time = latestTime(recognizer);
    switch (recognizer.state) {
      case 'began':
        if (this.liftTime == null) {
          this.lift(time);
        }
        if (recognizer === this.pan) {
          // The pan begins past its threshold: the thumb catches up now.
          this.move(time, travelX(recognizer));
        }
        return;
      case 'changed':
        this.move(time, travelX(recognizer));
        return;
      case 'ended':
        // The lift is a step of its own: a flip armed by the last move
        // happens here (a fast swipe flips on the lift).
        this.move(time, travelX(recognizer));
        this.release(time);
        return;
      case 'cancelled':
        if (
          !(this.press != null && isActive(this.press.state)) &&
          !(this.pan != null && isActive(this.pan.state))
        ) {
          this.abandon(time);
        }
        return;
      case 'possible':
      case 'failed':
        return;
    }
  }

  /**
   * One touch event of a held or dragged switch: retarget the thumb at the
   * finger (one style write) and step the flip rule on the finger's x.
   */
  private move(time: number, travel: number | null): void {
    const thumb = this.thumb;
    if (thumb == null || this.isStepping) {
      return;
    }
    this.isStepping = true;
    queueMicrotask(() => {
      this.isStepping = false;
    });
    const x = this.direction * (travel ?? this.lastTravel);
    this.lastTravel = travel ?? this.lastTravel;
    const drag = (this.drag ??= {
      start: this.downOffset,
      flip: startFlip(this.isOn),
    });
    thumb.animate(
      {x: this.toX(dragTarget(drag.start, x, this.geometry))},
      {spring: TRACKING},
      {at: time, reducedMotion: 'keep'},
    );
    drag.flip = stepFlip(drag.flip, x, this.geometry);
    if (drag.flip.isVisuallyOn !== this.isVisuallyOn) {
      this.showWell(drag.flip.isVisuallyOn, time);
    }
  }

  /** The finger lifted after a tap, a hold or a drag. */
  private release(time: number): void {
    if (this.released) {
      return;
    }
    this.released = true;
    this.clearTimers();
    const commit = commitOnRelease(this.drag?.flip ?? null, this.isOn);
    this.drag = null;
    if (this.liftTime == null) {
      // A tap quicker than a scroller's content delay: the lift shows now.
      this.lift(time);
    }
    this.showSide(commit, time);
    this.settle(time);
    this.releaseSelectionSoon();
    if (commit !== this.isOn) {
      // The browser's click was cancelled with the gesture; the input's own
      // click keeps every native path (form value, onChange, the label).
      this.elements?.input.click();
    }
    // If the owner kept the old value, the visuals go back to it.
    this.reconcileTimer = setTimeout(() => {
      this.reconcileTimer = null;
      if (this.drag == null && this.isVisuallyOn !== this.isOn) {
        this.showSide(this.isOn, now());
      }
    }, 0);
  }

  /** The touch ended without a release (cancelled, or the switch turned off). */
  private abandon(time: number): void {
    this.drag = null;
    this.showSide(this.isOn, time);
    this.settle(time);
    this.releaseSelectionSoon();
  }

  // --- Visuals ---------------------------------------------------------------

  private rest(isOn: boolean): number {
    return isOn ? this.geometry.travel : 0;
  }

  /** The animator's x for a thumb offset, relative to its CSS place. */
  private toX(offset: number): number {
    return this.direction * (offset - this.rest(this.isOn));
  }

  /** The thumb's offset on screen at `time`, from the curve. */
  private offsetAt(time: number): number {
    const x = this.thumb?.get('x', time) ?? 0;
    return this.rest(this.isOn) + this.direction * x;
  }

  private showWell(isOn: boolean, time: number): void {
    this.isVisuallyOn = isOn;
    this.on?.animate(
      {opacity: isOn ? 1 : 0},
      {spring: isOn ? switchControl.wellOn : switchControl.wellOff},
      {at: time, reducedMotion: 'keep'},
    );
  }

  /** Track color and thumb head for one side. */
  private showSide(isOn: boolean, time: number, velocity?: number): void {
    if (isOn !== this.isVisuallyOn) {
      this.showWell(isOn, time);
    }
    this.thumb?.animate(
      {x: this.toX(this.rest(isOn))},
      {
        spring: TRAVEL,
        velocity: velocity == null ? undefined : {x: velocity},
      },
      {at: time, reducedMotion: 'keep'},
    );
  }

  private lift(time: number): void {
    if (this.thumb == null) {
      return;
    }
    this.liftTime = time;
    this.guardSelection();
    const options = {at: time, reducedMotion: 'keep'} as const;
    this.thumb.animate(
      {scaleX: this.geometry.liftScaleX, scaleY: this.geometry.liftScaleY},
      {spring: LIFT},
      options,
    );
    this.fill?.animate({opacity: 0}, {spring: LIFT}, options);
    this.glass?.animate({opacity: 1}, {spring: LIFT}, options);
  }

  /** Back to a white capsule, no sooner than `minimumLiftMs` after the lift. */
  private settle(time: number): void {
    const liftTime = this.liftTime;
    if (liftTime == null) {
      return;
    }
    this.liftTime = null;
    const hold = (settleTime(time, liftTime) - time) / 1000;
    const play = (
      animator: Animator | null,
      property: 'scaleX' | 'scaleY' | 'opacity',
      lifted: number,
      rest: number,
      threshold: number,
    ) => {
      if (animator == null) {
        return;
      }
      animator.play(
        {
          [property]: liftThenSettle({
            from: animator.get(property, time),
            velocity: animator.getVelocity(property, time),
            lifted,
            rest,
            holdSeconds: hold,
            threshold,
          }),
        },
        {at: time, reducedMotion: 'keep'},
      );
    };
    play(this.thumb, 'scaleX', this.geometry.liftScaleX, 1, 1e-4);
    play(this.thumb, 'scaleY', this.geometry.liftScaleY, 1, 1e-4);
    play(this.fill, 'opacity', 0, 1, 1e-3);
    play(this.glass, 'opacity', 1, 0, 1e-3);
  }

  private clearTimers(): void {
    if (this.reconcileTimer != null) {
      clearTimeout(this.reconcileTimer);
      this.reconcileTimer = null;
    }
  }
}

/**
 * Switch's touch presentation, attached while the primary pointer is coarse.
 * Its parts must be rendered (and styled for touch) whether or not it is
 * active; it only animates and listens.
 */
export function useSwitchTouch(
  parts: SwitchTouchParts,
  {isOn, isInteractive, geometry}: SwitchTouchOptions,
): void {
  const {isTouch} = useTouchPresentation();
  const [controller] = useState(
    () => new SwitchTouchController(isOn, geometry),
  );

  // Value first: the CSS place of the thumb has just changed with it.
  useIsomorphicLayoutEffect(() => {
    controller.setValue(isOn);
  }, [controller, isOn]);

  useIsomorphicLayoutEffect(() => {
    controller.setGeometry(geometry);
  }, [controller, geometry]);

  useIsomorphicLayoutEffect(() => {
    controller.setInteractive(isInteractive);
  }, [controller, isInteractive]);

  useIsomorphicLayoutEffect(() => {
    const surface = parts.surface.current;
    const input = parts.input.current;
    const thumb = parts.thumb.current;
    const fill = parts.fill.current;
    const glass = parts.glass.current;
    const on = parts.on.current;
    if (
      !isTouch ||
      surface == null ||
      input == null ||
      thumb == null ||
      fill == null ||
      glass == null ||
      on == null
    ) {
      return undefined;
    }
    controller.attach({surface, input, thumb, fill, glass, on});
    return () => controller.detach();
  }, [controller, isTouch, parts]);
}
