// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSwitchTouch.ts
 * @input Switch's parts (gesture surface, input, thumb and track; the fade
 *   layer is the track's ::before, so the touch presentation adds no
 *   element), its value, whether it is interactive, the track's
 *   other state (switchFill.ts) and the thumb geometry (switchTouch.ts)
 * @output Exports useSwitchTouch: Switch's touch presentation. A drag moves
 *   the thumb with a rubber band and flips
 *   the switch; a release commits; every motion runs on the compositor
 * @position DOM half of Switch's touch presentation, on the gesture system
 *   (../gestures) and the compositor animator (../motion/animator). Active
 *   under a finger, one model on every touch device (`spec:AST-094`); a mouse
 *   keeps the switch's own presentation
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
 *     drag after the hold does not scroll and the release toggles; a scroll
 *     that starts on the switch waits for a busy main thread, as UIKit's
 *     own scroll view would.
 *   - Passive: a PressTracker, UIControl's tracking, which never blocks a
 *     scroll. The press begins with the touch or once a horizontal move
 *     would begin a pan; `touch-action: pan-y` (Switch.tsx) keeps
 *     horizontal moves for the switch, so a drag follows and flips it, and
 *     the release commits. A vertical drag, even after a hold, is the page's
 *     scroll: the browser takes the touch and the switch yields.
 *   Either way the browser's own click is cancelled (by the recognizers,
 *   or by cancelling the release's `touchend`) and the switch clicks its
 *   input itself, so forms, `onChange` and keyboard activation stay the
 *   native checkbox's.
 * - The drag never renders: each move retargets the thumb's tracking spring
 *   (one style write) and steps the flip rule on the finger's travel; the
 *   thumb's position comes from its curve, never from layout.
 * - Nothing lifts: UISwitch's lift, the thumb becoming a clear glass lens,
 *   waits on its own look-and-feel decision. The press shows the shared
 *   pressed overlay (design:user-states), as with any other control.
 * - The track keeps its own fill, the theme's, in both states; the colour
 *   change is a fade layer over it, painted with the track's other fill
 *   (switchFill.ts) and faded on the compositor: clear while the visuals
 *   show the value, opaque while they show the other side. When the value
 *   changes, the layer swaps to the other fill and to the complement of its
 *   opacity, so nothing changes on screen. The layer is composited from the
 *   start (`will-change` under a coarse pointer, Switch.tsx): iOS Safari
 *   otherwise ran its fade on the main thread, and a busy main thread froze
 *   the track colour while the thumb moved.
 * - Under reduced motion (design:reduced-motion) nothing travels or
 *   springs: a tap, a release or a value change plays the animator's Reduce
 *   Motion cross-fade (the thumb fades out where it is and in at its rest)
 *   and the colour layer fades on the same fade. The thumb under a dragging
 *   finger still follows it (direct manipulation). UISwitch itself keeps its
 *   springs; the record decides here.
 * - The springs are motion roles a theme can retune: the animator resolves
 *   each spring it is handed.
 *
 * SYNC: When modified, update switchTouch.ts, switchTouchClaim.ts, Switch.tsx
 * and __tests__/Switch.interaction.browser.spec.ts.
 */

import {useMemo, useState, type RefObject} from 'react';
import {getGestureHost} from '../gestures/GestureHost';
import {isActive, type GestureRecognizer} from '../gestures/GestureRecognizer';
import {LongPressGestureRecognizer} from '../gestures/LongPressGestureRecognizer';
import {PanGestureRecognizer} from '../gestures/PanGestureRecognizer';
import {PressTracker, type ControlEvent} from '../gestures/PressTracker';
import {TapGestureRecognizer} from '../gestures/TapGestureRecognizer';
import type {GestureTouch} from '../gestures/types';
import {isRtlElement} from '../hooks/isRtlElement';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {createAnimator, type Animator} from '../motion/animator';
import {UIKIT_GESTURES} from '../motion/uikit/gestures';
import {registerSwitchTable, switchControl} from '../motion/uikit/switch';
import {useTouchPresentation} from '../utils/touchPresentation';
import {
  commitOnRelease,
  dragTarget,
  startFlip,
  stepFlip,
  switchTouchGeometry,
  type SwitchFlip,
  type SwitchTouchGeometry,
} from './switchTouch';
import {readFillOf, trackStateOf, type TrackState} from './switchFill';
import {SWITCH_CLAIMS_HELD_TOUCH} from './switchTouchClaim';

export interface SwitchTouchParts {
  /** Receives the touches: the input and the track. */
  readonly surface: RefObject<HTMLElement | null>;
  readonly input: RefObject<HTMLInputElement | null>;
  /** Moves: the themed thumb itself. */
  readonly thumb: RefObject<HTMLElement | null>;
  /**
   * The track: its `::before` is the fade layer over its own fill, showing
   * the fill it is leaving or heading to (switchFill.ts).
   */
  readonly track: RefObject<HTMLElement | null>;
}

export interface SwitchTouchOptions {
  readonly isOn: boolean;
  /** False while disabled or busy: no touch is tracked. */
  readonly isInteractive: boolean;
  /** The track's box, px (width × height): the thumb geometry's scale. */
  readonly trackSize: readonly [number, number];
  /**
   * The props the track renders with in its other state (its theme target
   * and fill), for the fade layer's colour.
   */
  readonly otherTrackProps: object;
}

/** The fade layer's colour, set on the track for its ::before (Switch.tsx). */
const FADE_FILL = '--_switch-fade-fill';
const TRAVEL = switchControl.travel;
const TRACKING = switchControl.tracking;
/** UIScrollView's content-touch delay: the press waits for it in a scroller. */
const PRESS_DELAY = UIKIT_GESTURES.press.contentTouchDelay.value;
const TOUCH_TYPES = ['touch', 'pen'] as const;
/**
 * Passive: horizontal travel at which the press begins if it has not (a pan
 * begins here), px.
 */
const PAN_HYSTERESIS = UIKIT_GESTURES.pan.hysteresis.value;
/**
 * Passive: how long after the switch's own release the browser's trusted
 * click is swallowed, ms (it follows the release within a frame or two).
 */
const CLICK_GUARD_MS = 1000;

function now(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
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
  track: HTMLElement;
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
  /** The fade layer: its opacity is how far the visuals are from the value. */
  private fade: Animator | null = null;
  private otherTrack: TrackState | null = null;
  private press: LongPressGestureRecognizer | null = null;
  private pan: PanGestureRecognizer | null = null;
  private tap: TapGestureRecognizer | null = null;
  private detachers: (() => void)[] = [];
  /** When the press began (document timeline, ms); null with no press. */
  private pressTime: number | null = null;
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
  /**
   * Reduced motion: a release changed the value, and the thumb's travel waits
   * for the value to commit, so its one cross-fade lands in the new frame.
   */
  private pendingTravel = false;
  /** Passive: a finger is down on the switch. */
  private isTracking = false;
  /** Passive: until when the browser's next trusted click is swallowed. */
  private clickGuardUntil = 0;
  /** Passive: the switch released on this touch; its `touchend` is cancelled. */
  private cancelsTouchEnd = false;
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
    // The switch's springs become motion roles before the first animation
    // resolves one (idempotent; nothing registers on import).
    registerSwitchTable();
    this.elements = elements;
    this.direction = isRtlElement(elements.surface) ? -1 : 1;
    this.isVisuallyOn = this.isOn;
    this.thumb = createAnimator(elements.thumb);
    // The layer rests clear (its class's opacity 0) while the visuals show
    // the value; from here its opacity is the animator's.
    this.fade = createAnimator(elements.track, {
      pseudoElement: '::before',
      initial: {opacity: 0},
    });
    this.fade.set({opacity: 0});
    this.paintFade();

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
      // A drag that drives the thumb selects no text (the gesture host locks
      // the surface for the contact); the press's own styles do the same.
      preventsTextSelection: true,
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
   * Passive: UIControl's tracking, which never blocks a scroll. The press
   * begins with the touch (same frame outside a scroller, after the content
   * delay inside one) or with the first horizontal move a pan would begin
   * on; every move follows and steps the flip rule; the release commits; a
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
        if (isHighlighted && this.isTracking && this.pressTime == null) {
          this.pressBegan(now());
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
      if (this.pressTime != null) {
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
    this.clearTimers();
    for (const animator of [this.thumb, this.fade]) {
      const element = animator?.element;
      animator?.dispose();
      if (element != null) {
        for (const property of ['translate', 'scale', 'opacity']) {
          element.style.removeProperty(property);
        }
      }
    }
    this.elements?.track.style.removeProperty(FADE_FILL);
    this.thumb = this.fade = null;
    this.press = this.pan = this.tap = null;
    this.elements = null;
    this.pressTime = null;
    this.drag = null;
    this.isTracking = false;
    this.clickGuardUntil = 0;
  }

  setInteractive(isInteractive: boolean): void {
    this.isInteractive = isInteractive;
    for (const recognizer of [this.press, this.pan, this.tap]) {
      recognizer?.setEnabled(isInteractive);
    }
    if (!isInteractive && this.pressTime != null) {
      this.abandon(now());
    }
  }

  /** The track's other state, re-rendered with each value. */
  setOtherTrack(otherTrack: TrackState): void {
    this.otherTrack = otherTrack;
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
    // The thumb's CSS rest moved with the value: shift it back by as much,
    // so nothing moves on screen. A spring keeps its target through the
    // shift and is sent to the new rest below; a reduced-motion dip shifts
    // whole, its end included, and keeps going.
    const springs = thumb.reducedMotion() === 'off';
    thumb.rebase(
      {x: this.direction * (this.rest(previous) - this.rest(isOn))},
      {at: time},
    );
    // The track now shows the new value's fill: the fade layer swaps to the
    // other fill and to the complement of its opacity, so nothing changes on
    // screen, and keeps heading where the visuals head.
    const fade = this.fade;
    if (fade != null) {
      const opacity = fade.get('opacity', time);
      const fadeVelocity = fade.getVelocity('opacity', time);
      this.paintFade();
      fade.set({opacity: 1 - opacity});
      this.animateFade(time, -fadeVelocity);
    }
    const wasDragging = this.drag != null && !this.released;
    if (wasDragging) {
      // The app changed the value mid-gesture: the value wins and the
      // gesture ends without committing.
      this.drag = null;
      this.released = true;
      for (const recognizer of [this.press, this.pan]) {
        recognizer?.setEnabled(false);
        recognizer?.setEnabled(this.isInteractive);
      }
      this.pressEnded();
    }
    // A release already sent the visuals here; any other change (the app's,
    // or one mid-gesture) sends them now, and a spring heads for the new rest.
    if (
      springs ||
      wasDragging ||
      this.pendingTravel ||
      this.isVisuallyOn !== isOn
    ) {
      const touchRelease = this.pendingTravel;
      this.pendingTravel = false;
      this.showSide(isOn, time, thumb.getVelocity('x', time), touchRelease);
    }
  }

  // --- Touches ---------------------------------------------------------------

  private touchDown(time: number): void {
    this.released = false;
    this.pendingTravel = false;
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
        if (this.pressTime == null) {
          if (Math.abs(travel) < PAN_HYSTERESIS) {
            return;
          }
          // A pan would begin here: the switch takes the horizontal drag.
          this.pressBegan(touch.time);
        }
        this.move(touch.time, travel);
        return;
      case 'touchUpInside':
      case 'touchUpOutside':
        this.isTracking = false;
        if (this.released || !this.isInteractive) {
          return;
        }
        // The finger's lift is a step of its own: a flip armed by the last
        // move happens here (a fast swipe flips on the lift).
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

  private onGesture(
    recognizer: LongPressGestureRecognizer | PanGestureRecognizer,
  ): void {
    if (this.released) {
      return;
    }
    const time = latestTime(recognizer);
    switch (recognizer.state) {
      case 'began':
        if (this.pressTime == null) {
          this.pressBegan(time);
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
        // The finger's lift is a step of its own: a flip armed by the last
        // move happens here (a fast swipe flips on the lift).
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
    // The thumb under the finger is direct manipulation, which reduced
    // motion leaves alone (design:reduced-motion): under it the thumb is
    // placed at once, since the animator would cross-fade a move.
    const target = this.toX(dragTarget(drag.start, x, this.geometry));
    if (thumb.reducedMotion() === 'off') {
      thumb.animate({x: target}, {spring: TRACKING}, {at: time});
    } else {
      thumb.set({x: target});
    }
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
    if (this.pressTime == null) {
      // A tap quicker than a scroller's content delay: the press begins now.
      this.pressBegan(time);
    }
    if (
      commit !== this.isOn &&
      this.thumb?.reducedMotion({touchRelease: true}) !== 'off'
    ) {
      // Under reduced motion the travel is one cross-fade, played when the
      // value commits (setValue) so that it lands in the new value's frame;
      // the colour starts now.
      this.pendingTravel = true;
      this.showWell(commit, time, true);
    } else {
      this.showSide(commit, time, undefined, true);
    }
    this.pressEnded();
    if (commit !== this.isOn) {
      // The browser's click was cancelled with the gesture; the input's own
      // click keeps every native path (form value, onChange, the label).
      this.elements?.input.click();
    }
    // If the owner kept the old value, the visuals go back to it.
    this.reconcileTimer = setTimeout(() => {
      this.reconcileTimer = null;
      if (this.drag == null && this.isVisuallyOn !== this.isOn) {
        this.pendingTravel = false;
        this.showSide(this.isOn, now(), undefined, true);
      }
    }, 0);
  }

  /** The touch ended without a release (cancelled, or the switch turned off). */
  private abandon(time: number): void {
    this.drag = null;
    this.showSide(this.isOn, time, undefined, true);
    this.pressEnded();
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

  private showWell(isOn: boolean, time: number, touchRelease = false): void {
    this.isVisuallyOn = isOn;
    this.paintFade();
    this.animateFade(time, undefined, touchRelease);
  }

  /**
   * The fade layer heads for the visuals: clear when they show the value,
   * opaque (the other fill) when they show the other side, on UIKit's well
   * springs (on: 0.68 s, off: 0.40 s).
   */
  private animateFade(
    time: number,
    velocity?: number,
    touchRelease = false,
  ): void {
    // Under reduced motion the animator plays this as its cross-fade.
    this.fade?.animate(
      {opacity: this.isVisuallyOn === this.isOn ? 0 : 1},
      {
        spring: this.isVisuallyOn
          ? switchControl.wellOn
          : switchControl.wellOff,
        velocity: velocity == null ? undefined : {opacity: velocity},
      },
      {at: time, touchRelease},
    );
  }

  /** The fade layer's colour: the track's fill in its other state. */
  private paintFade(): void {
    const track = this.elements?.track;
    if (track == null || this.otherTrack == null) {
      return;
    }
    track.style.setProperty(FADE_FILL, readFillOf(track, this.otherTrack));
  }

  /** Track color and thumb head for one side. */
  private showSide(
    isOn: boolean,
    time: number,
    velocity?: number,
    touchRelease = false,
  ): void {
    if (isOn !== this.isVisuallyOn) {
      this.showWell(isOn, time, touchRelease);
    }
    // Under reduced motion the animator cross-fades this travel: the thumb
    // fades out where it is and back in at its rest.
    this.thumb?.animate(
      {x: this.toX(this.rest(isOn))},
      {
        spring: TRAVEL,
        velocity: velocity == null ? undefined : {x: velocity},
      },
      {at: time, touchRelease},
    );
  }

  /**
   * The press began: the switch holds the touch from here. Nothing moves:
   * UISwitch's lift (a clear glass lens) waits on its own look-and-feel
   * decision, and the press shows the shared pressed overlay meanwhile.
   */
  private pressBegan(time: number): void {
    this.pressTime = time;
  }

  /** The press ended (a release, a cancel or the switch turning off). */
  private pressEnded(): void {
    this.pressTime = null;
  }

  private clearTimers(): void {
    if (this.reconcileTimer != null) {
      clearTimeout(this.reconcileTimer);
      this.reconcileTimer = null;
    }
  }
}

/**
 * Switch's touch presentation, attached under a finger (a coarse primary
 * pointer). Its parts must be rendered (and styled for it) whether or not it
 * is active; it only animates and listens.
 */
export function useSwitchTouch(
  parts: SwitchTouchParts,
  {isOn, isInteractive, trackSize, otherTrackProps}: SwitchTouchOptions,
): void {
  const {isTouch} = useTouchPresentation();
  const [trackWidth, trackHeight] = trackSize;
  const geometry = useMemo(
    () => switchTouchGeometry(trackWidth, trackHeight),
    [trackWidth, trackHeight],
  );
  const otherTrack = trackStateOf(otherTrackProps);
  const [controller] = useState(
    () => new SwitchTouchController(isOn, geometry),
  );

  // Value first: the CSS place of the thumb has just changed with it, and the
  // track's fill.
  useIsomorphicLayoutEffect(() => {
    controller.setOtherTrack(otherTrack);
    controller.setValue(isOn);
  });

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
    const track = parts.track.current;
    if (
      !isTouch ||
      surface == null ||
      input == null ||
      thumb == null ||
      track == null
    ) {
      return undefined;
    }
    controller.attach({surface, input, thumb, track});
    return () => controller.detach();
  }, [controller, isTouch, parts]);
}
