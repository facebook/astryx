// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSwitchTouch.ts
 * @input Switch's parts (gesture surface, input, thumb and track; the colour
 *   fade is the track's ::after and the lifted shadow the thumb's ::after,
 *   so the touch presentation adds no element), its value, whether it is
 *   interactive, the track's
 *   other state (switchFill.ts) and the thumb geometry (switchTouch.ts)
 * @output Exports useSwitchTouch: Switch's gestures for every pointer and its
 *   touch presentation. A drag flips the switch and a release commits; under
 *   a finger the drag moves the thumb with a rubber band and every motion
 *   runs on the compositor
 * @position DOM half of Switch's touch presentation, on the gesture system
 *   (../gestures) and the compositor animator (../motion/animator). Its
 *   gestures work for a mouse, a pen and a finger (`spec:AST-094` FR43); its
 *   presentation is the touch presentation's, under a coarse primary pointer
 *   (FR13), and under a fine one the switch keeps its own look, which the
 *   value moves
 *
 * UISwitch on iOS 26.2 is the reference; every number is in
 * motion/uikit/switch.ts. How it maps onto the web:
 *
 * - The thumb's resting place is CSS (its inline-start inset), so the steady
 *   state needs no script and mirrors under RTL by itself. The animator only
 *   ever moves the thumb by a delta from that place (`translate`), and when
 *   the value changes and the CSS place jumps, the delta is rebased in the
 *   same layout effect, so nothing moves on screen and the velocity is kept.
 * - Touches go to the gesture system's PressTracker, UIControl's tracking,
 *   which never blocks a scroll (`spec:AST-094` FR11, FR20, FR21): no
 *   recognizer claims the touch. The press begins with the touch or once a
 *   horizontal move would begin a pan; `touch-action: pan-y` (Switch.tsx)
 *   keeps horizontal moves for the switch, so a drag follows and flips it,
 *   and the release commits. A vertical drag, even after a hold, is the
 *   page's scroll: the browser takes the touch and the switch yields.
 *   A tap, a hold or a short drag activates through the browser's own click
 *   (FR11); where the browser sends no click for a finger's lift (a hold),
 *   the switch clicks its input itself once the click window passes. A mouse
 *   or a pen gets a click whenever it is released on the input, so one that
 *   sends none was released off it and the switch is left alone. A drag
 *   that flipped the switch gets no click from the browser, so its
 *   `touchend` is cancelled and the switch clicks its input. A press slid off and lifted outside
 *   toggles too, as UISwitch's does (`spec:AST-020` FR9/DEC-5, the
 *   reversible-toggle exception), and the switch clicks its input for it. Forms, `onChange` and keyboard activation
 *   stay the native checkbox's.
 * - The drag never renders: each move retargets the thumb's tracking spring
 *   (one style write) and steps the flip rule on the finger's travel; the
 *   thumb's position comes from its curve, never from layout.
 * - The thumb lifts while a finger presses: it grows about its center on
 *   UISwitch's lift spring, into half of the gap around it (switchTouch.ts),
 *   and its lifted shadow, the theme's `--shadow-low` on the thumb's
 *   `::after`, fades in; at the release it settles back on the settle
 *   spring, no sooner than the minimum lift time after it began. The lift
 *   and the settle are one curve built at the release, so the settle starts
 *   on time on the compositor. The press also shows the shared pressed
 *   overlay (design:user-states), as the track's ::before under the thumb,
 *   released on the compositor (Switch.tsx, switchPressLayer.ts).
 * - The track keeps its own fill, the theme's, in both states; the colour
 *   change is a fade layer over it, painted with the track's other fill
 *   (switchFill.ts) and faded on the compositor: clear while the visuals
 *   show the value, opaque while they show the other side. When the value
 *   changes, the layer swaps to the other fill and to the complement of its
 *   opacity, so nothing changes on screen. A change the fade is already
 *   heading to (a release, a drag that flipped) swaps nothing then: the
 *   track holds its previous fill inline until the fade lands, and the swap
 *   happens under the opaque layer. WebKit plays a curve built in a frame a
 *   long task holds from its start once the task ends, so a swap in the
 *   change's frame stepped the track back toward the fill it left (iOS
 *   26.2, a 700 ms task in that frame). The layer is composited from the
 *   start (`will-change` under a coarse pointer, Switch.tsx): iOS Safari
 *   otherwise ran its fade on the main thread, and a busy main thread froze
 *   the track colour while the thumb moved.
 * - Under reduced motion (design:reduced-motion) nothing travels or
 *   springs: a tap, a release or a value change plays the animator's Reduce
 *   Motion cross-fade (the thumb fades out where it is and in at its rest)
 *   and the colour layer fades on the same fade. The thumb under a dragging
 *   finger still follows it (direct manipulation). UISwitch itself keeps its
 *   springs; the record decides here.
 * - Under a fine primary pointer the switch keeps its own presentation
 *   (FR13): the same tracking, flip rule and release decide the value, with
 *   no animator, no lift and no colour fade, and the thumb moves when the
 *   value does. Only its press listens at rest (one passive `pointerdown`
 *   the gesture host arms, FR24); the click guard and the context-menu
 *   block come with a press and go with its click window.
 * - A mouse or a pen slid off and released outside without a flip leaves
 *   the switch alone, as the native checkbox does: the reversible-toggle
 *   exception (Switch FR6) is a finger's.
 * - The springs and the minimum lift time play as the motion roles
 *   `component:Switch` names (`switchControl.lift` and so on: `spec:AST-094`
 *   FR4, DEC-5), registered by registerSwitchTable() before the first
 *   animation; they stay internal (DEC-11).
 *
 * SYNC: When modified, update switchTouch.ts, Switch.tsx
 * and __tests__/Switch.interaction.browser.spec.ts.
 */

import {useMemo, useState, type RefObject} from 'react';
import {getGestureHost} from '../gestures/GestureHost';
import {PressTracker, type ControlEvent} from '../gestures/PressTracker';
import type {GestureTouch} from '../gestures/types';
import {isRtlElement} from '../hooks/isRtlElement';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {
  createAnimator,
  type Animator,
  type MotionCurve,
} from '../motion/animator';
import {solveSpring, toSpring, type SpringDescription} from '../motion/spring';
import {UIKIT_GESTURES} from '../motion/uikit/gestures';
import {registerSwitchTable, switchControl} from '../motion/uikit/switch';
import {useTouchPresentation} from '../utils/touchPresentation';
import {
  commitOnRelease,
  dragTarget,
  settleTime,
  startFlip,
  stepFlip,
  switchTouchGeometry,
  type SwitchFlip,
  type SwitchTouchGeometry,
} from './switchTouch';
import {
  readFillOf,
  sameTrackState,
  trackStateOf,
  type TrackState,
} from './switchFill';

export interface SwitchTouchParts {
  /** Receives the touches: the input and the track. */
  readonly surface: RefObject<HTMLElement | null>;
  readonly input: RefObject<HTMLInputElement | null>;
  /** Moves: the themed thumb itself. */
  readonly thumb: RefObject<HTMLElement | null>;
  /**
   * The track: its `::after` is the fade layer over its own fill, showing
   * the fill it is leaving or heading to (switchFill.ts).
   */
  readonly track: RefObject<HTMLElement | null>;
}

export interface SwitchTouchOptions {
  readonly isOn: boolean;
  /** False while disabled or busy: no touch is tracked. */
  readonly isInteractive: boolean;
  /**
   * Disabled: the touch presentation is off and attaches nothing (FR24). A
   * busy switch stays attached, so a change that starts a busy state still
   * plays its release motion.
   */
  readonly isDisabled: boolean;
  /** The track's box, px (width × height): the thumb geometry's scale. */
  readonly trackSize: readonly [number, number];
  /**
   * The props the track renders with in its other state (its theme target
   * and fill), for the fade layer's colour.
   */
  readonly otherTrackProps: object;
}

/** The fade layer's colour, set on the track for its ::after (Switch.tsx). */
const FADE_FILL = '--_switch-fade-fill';
/** The track's own fill while a change is held (inline, over its CSS). */
const BASE_FILL = 'background-color';
const TRAVEL = switchControl.travel;
const TRACKING = switchControl.tracking;
/**
 * Horizontal travel at which the press begins if it has not (a pan
 * begins here), px.
 */
const PAN_HYSTERESIS = UIKIT_GESTURES.pan.hysteresis.value;
/**
 * How long after the switch's own release the browser's trusted
 * click is swallowed, ms (it follows the release within a frame or two).
 */
const CLICK_GUARD_MS = 1000;
/**
 * Passive: how long a lift waits for the browser's own click before the
 * switch clicks its input itself, ms. The browser sends it with the lift's
 * `touchend` (the surface's `touch-action` leaves no double-tap delay), so
 * this only runs out for a lift the browser does not count as a click.
 */
const BROWSER_CLICK_WAIT_MS = 300;

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
  lift,
  settle,
}: {
  from: number;
  velocity: number;
  lifted: number;
  rest: number;
  holdSeconds: number;
  threshold: number;
  /** The lift and settle springs as the theme sets them. */
  lift: SpringDescription;
  settle: SpringDescription;
}): MotionCurve {
  const hold = Math.max(0, holdSeconds);
  const first = solveSpring(toSpring(lift), {from, to: lifted, velocity});
  const second = solveSpring(toSpring(settle), {
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

/**
 * The switch's presentation: the touch presentation under a coarse primary
 * pointer, or its own under a fine one (`spec:AST-094` FR13).
 */
type SwitchPresentation = 'touch' | 'pointer';

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
  /** The lifted shadow: the thumb's `::after`, faded in with the lift. */
  private shadow: Animator | null = null;
  /** When the thumb lifted (document timeline, ms); null while at rest. */
  private liftTime: number | null = null;
  /** When the running settle leaves the lift (settleTime), ms. */
  private settleAt: number | null = null;
  private otherTrack: TrackState | null = null;
  /**
   * A change landed mid-fade, the fade already heading to it: the track's own
   * fill stays the previous value's (inline) until the fade lands, so the
   * change's frame builds no curve and repaints nothing. `baseHold` counts
   * holds, so a settled one ignores its late landing.
   */
  private baseHeld = false;
  private baseHold = 0;
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
  /** Which presentation the switch has: the touch one, or its own (FR13). */
  private presentation: SwitchPresentation = 'touch';
  /** The press-time listeners under a fine pointer, while armed. */
  private pressListeners: (() => void) | null = null;
  private pressListenersTimer: ReturnType<typeof setTimeout> | null = null;
  /** Passive: the switch released on this touch; its `touchend` is cancelled. */
  private cancelsTouchEnd = false;
  /** Passive: a lift is waiting for the browser's own click. */
  private browserClickTimer: ReturnType<typeof setTimeout> | null = null;
  private reconcileTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(isOn: boolean, geometry: SwitchTouchGeometry) {
    this.isOn = isOn;
    this.isVisuallyOn = isOn;
    this.geometry = geometry;
  }

  get isAttached(): boolean {
    return this.elements != null;
  }

  attach(elements: Elements, presentation: SwitchPresentation): void {
    this.detach();
    this.elements = elements;
    this.presentation = presentation;
    this.measureGeometry();
    this.direction = isRtlElement(elements.surface) ? -1 : 1;
    this.isVisuallyOn = this.isOn;
    const host = getGestureHost(elements.surface.ownerDocument);
    if (presentation === 'pointer') {
      // The switch's own look: the gestures decide the value and the CSS
      // shows it (FR13, FR43).
      this.detachers = this.attachPassive(host, elements);
      return;
    }
    // The switch's springs play as its motion roles (spec:AST-094 FR4).
    registerSwitchTable();
    this.thumb = createAnimator(elements.thumb);
    // The layer rests clear (its class's opacity 0) while the visuals show
    // the value; from here its opacity is the animator's.
    this.fade = createAnimator(elements.track, {
      pseudoElement: '::after',
      initial: {opacity: 0},
    });
    this.fade.set({opacity: 0});
    this.shadow = createAnimator(elements.thumb, {
      pseudoElement: '::after',
      initial: {opacity: 0},
    });
    this.shadow.set({opacity: 0});
    this.paintFade();
    this.detachers = this.attachPassive(host, elements);
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
      if (event.isTrusted && this.browserClickTimer != null) {
        // The lift's own click: it activates the input natively.
        clearTimeout(this.browserClickTimer);
        this.browserClickTimer = null;
        this.scheduleReconcile();
        return;
      }
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
    const listen = (): (() => void) => {
      surface.addEventListener('touchend', onTouchEnd, touchEndOptions);
      surface.addEventListener('click', onClick, true);
      surface.addEventListener('contextmenu', onContextMenu);
      return () => {
        surface.removeEventListener('touchend', onTouchEnd, touchEndOptions);
        surface.removeEventListener('click', onClick, true);
        surface.removeEventListener('contextmenu', onContextMenu);
      };
    };
    if (this.presentation === 'pointer') {
      // Under a fine pointer only the press the host arms listens at rest
      // (FR24): the switch's own listeners come with a press (touchDown)
      // and go once its click window is over.
      this.listenForPress = listen;
      return [
        host.attachConsumer(surface, tracker),
        () => tracker.dispose(),
        () => this.stopPressListeners(),
      ];
    }
    return [
      host.attachConsumer(surface, tracker),
      () => tracker.dispose(),
      listen(),
    ];
  }

  /** Under a fine pointer: adds the switch's own listeners for a press. */
  private listenForPress: (() => () => void) | null = null;

  private startPressListeners(): void {
    if (this.pressListenersTimer != null) {
      clearTimeout(this.pressListenersTimer);
      this.pressListenersTimer = null;
    }
    if (this.pressListeners == null && this.listenForPress != null) {
      this.pressListeners = this.listenForPress();
    }
  }

  /** The press's click window is over: its listeners go (FR24). */
  private endPressListeners(afterMs: number): void {
    if (this.pressListeners == null) {
      return;
    }
    if (this.pressListenersTimer != null) {
      clearTimeout(this.pressListenersTimer);
    }
    this.pressListenersTimer = setTimeout(() => {
      this.pressListenersTimer = null;
      this.stopPressListeners();
    }, afterMs);
  }

  private stopPressListeners(): void {
    if (this.pressListenersTimer != null) {
      clearTimeout(this.pressListenersTimer);
      this.pressListenersTimer = null;
    }
    this.pressListeners?.();
    this.pressListeners = null;
  }

  /** Undo everything: listeners, timers, animations and inline styles. */
  detach(): void {
    for (const detach of this.detachers) {
      detach();
    }
    this.detachers = [];
    this.listenForPress = null;
    this.clearTimers();
    for (const animator of [this.thumb, this.fade, this.shadow]) {
      const element = animator?.element;
      animator?.dispose();
      if (element != null) {
        for (const property of ['translate', 'scale', 'opacity']) {
          element.style.removeProperty(property);
        }
      }
    }
    this.elements?.track.style.removeProperty(FADE_FILL);
    this.elements?.track.style.removeProperty(BASE_FILL);
    this.baseHeld = false;
    this.baseHold++;
    this.thumb = this.fade = this.shadow = null;
    this.liftTime = null;
    this.elements = null;
    this.pressTime = null;
    this.drag = null;
    this.isTracking = false;
    this.clickGuardUntil = 0;
  }

  setInteractive(isInteractive: boolean): void {
    this.isInteractive = isInteractive;
    if (!isInteractive && this.pressTime != null) {
      this.abandon(now());
    }
  }

  /** The track's other state, re-rendered with each value. */
  setOtherTrack(otherTrack: TrackState): void {
    const previous = this.otherTrack;
    this.otherTrack = otherTrack;
    // A held fill was read from the previous other state; a re-render that
    // keeps it keeps the hold.
    if (this.baseHeld && !sameTrackState(previous, otherTrack)) {
      this.landBase(now());
    }
  }

  setGeometry(geometry: SwitchTouchGeometry): void {
    this.geometry = geometry;
    this.measureGeometry();
    this.thumb?.set({x: 0, scaleX: 1, scaleY: 1});
  }

  /**
   * The thumb geometry from the rendered boxes: the track's, so a theme that
   * resizes the track moves the thumb by its own size, and the thumb's, the
   * circle of the current value (it rests by insets from the track's padding
   * box, so the track's padding does not move it).
   */
  private measureGeometry(): void {
    const track = this.elements?.track;
    const thumb = this.elements?.thumb;
    if (track == null) {
      return;
    }
    // Fractional boxes: the track's border box less its border (it has no
    // transform), and the thumb's used size from its computed style (its
    // scale does not change that): the circle of the current value.
    const box = track.getBoundingClientRect();
    const trackWidth = box.width - 2 * track.clientLeft;
    const trackHeight = box.height - 2 * track.clientTop;
    if (trackWidth <= 0 || trackHeight <= 0) {
      return;
    }
    const style = thumb == null ? null : getComputedStyle(thumb);
    const thumbWidth = style == null ? NaN : parseFloat(style.width);
    const thumbHeight = style == null ? NaN : parseFloat(style.height);
    this.geometry = switchTouchGeometry(
      trackWidth,
      trackHeight,
      thumbWidth > 0 && thumbHeight > 0
        ? {width: thumbWidth, height: thumbHeight}
        : undefined,
    );
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
    // Each state has its own thumb size (the circle a mouse sees, Switch
    // FR4): the box the CSS now renders is the new value's, so its scale
    // takes the old size over and grows or shrinks it from there.
    const before = this.geometry;
    this.measureGeometry();
    if (springs) {
      this.rescaleThumb(before, this.geometry, time);
    }
    // The track now shows the new value's fill: the fade layer swaps to the
    // other fill and to the complement of its opacity, so nothing changes on
    // screen, and keeps heading where the visuals head.
    const fade = this.fade;
    if (fade != null) {
      this.landBase(time);
      // Already heading here (a release, a drag that flipped): the running
      // fade carries the change, over the previous fill held as the track's
      // own until it lands. WebKit plays a curve built in a frame that a long
      // task holds from its start once the task ends, so a swap here would
      // step the track back toward the fill it left (iOS 26.2).
      if (this.isVisuallyOn !== isOn || !this.holdBase()) {
        this.swapFade(time);
      }
    }
    const wasDragging = this.drag != null && !this.released;
    if (wasDragging) {
      // The app changed the value mid-gesture: the value wins and the
      // gesture ends without committing.
      this.drag = null;
      this.released = true;
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
    this.landBase(time);
    this.released = false;
    this.pendingTravel = false;
    this.drag = null;
    this.lastTravel = 0;
    this.downOffset = this.offsetAt(time);
  }

  /** Passive: a mouse, a pen or a finger on the switch, UIControl's events (FR43). */
  private onControlEvent(event: ControlEvent, touch: GestureTouch): void {
    const travel = touch.x - touch.startX;
    switch (event) {
      case 'touchDown':
        this.isTracking = true;
        this.clickGuardUntil = 0;
        this.startPressListeners();
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
        if (this.drag?.flip.didFlip !== true && event === 'touchUpInside') {
          // A tap, a hold or a short drag: the browser's click activates it.
          // Only a finger's lift can come with no click (a hold); a mouse or
          // a pen gets one whenever it is released on the input, so with no
          // click it was released off the input, inside the tracking slop,
          // and the switch is left alone, as the native checkbox is.
          this.release(touch.time, {
            byBrowserClick: true,
            clicksIfNoBrowserClick: touch.pointerType === 'touch',
          });
          this.endPressListeners(BROWSER_CLICK_WAIT_MS + CLICK_GUARD_MS);
          return;
        }
        if (this.drag?.flip.didFlip !== true && touch.pointerType !== 'touch') {
          // A mouse or a pen slid off and released outside, with no flip:
          // the switch is left alone, as the native checkbox is (the
          // reversible-toggle exception, Switch FR6, is a finger's).
          this.released = true;
          this.abandon(touch.time);
          this.endPressListeners(0);
          return;
        }
        // A drag that flipped, or a press slid off and lifted outside (it
        // toggles, as UISwitch's does: `spec:AST-020` FR9/DEC-5, the
        // reversible-toggle exception): no click comes from the browser, so
        // the switch clicks its input and cancels the lift.
        this.cancelsTouchEnd = true;
        this.clickGuardUntil = now() + CLICK_GUARD_MS;
        this.release(touch.time);
        this.endPressListeners(CLICK_GUARD_MS);
        return;
      case 'touchCancel':
        // The browser took the touch for its scroll, or a recognizer above
        // took it: the switch yields.
        this.isTracking = false;
        if (!this.released) {
          this.released = true;
          this.abandon(touch.time);
        }
        this.endPressListeners(0);
        return;
      case 'touchDragEnter':
      case 'touchDragExit':
        return;
    }
  }

  /**
   * One touch event of a held or dragged switch: retarget the thumb at the
   * finger (one style write) and step the flip rule on the finger's x.
   */
  private move(time: number, travel: number | null): void {
    const thumb = this.thumb;
    if (this.isStepping) {
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
    // Under a fine pointer nothing follows the pointer: the switch keeps its
    // own look, and the value moves the thumb (FR13).
    if (thumb != null) {
      const target = this.toX(dragTarget(drag.start, x, this.geometry));
      if (thumb.reducedMotion() === 'off') {
        thumb.animate({x: target}, {spring: TRACKING}, {at: time});
      } else {
        thumb.set({x: target});
      }
    }
    drag.flip = stepFlip(drag.flip, x, this.geometry);
    if (drag.flip.isVisuallyOn !== this.isVisuallyOn) {
      this.showWell(drag.flip.isVisuallyOn, time);
    }
  }

  /**
   * The finger lifted after a tap, a hold or a drag. `byBrowserClick`: the
   * browser's own click activates the input, and the switch clicks it only
   * if that click never comes.
   */
  private release(
    time: number,
    {
      byBrowserClick = false,
      clicksIfNoBrowserClick = true,
    }: {byBrowserClick?: boolean; clicksIfNoBrowserClick?: boolean} = {},
  ): void {
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
      this.thumb != null &&
      this.thumb.reducedMotion({touchRelease: true}) !== 'off'
    ) {
      // Under reduced motion the travel is one cross-fade, played when the
      // value commits (setValue) so that it lands in the new value's frame;
      // the colour starts now.
      this.pendingTravel = true;
      this.showWell(commit, time, true);
    } else {
      this.showSide(commit, time, undefined, true);
    }
    this.pressEnded(time, true);
    if (byBrowserClick) {
      this.browserClickTimer = setTimeout(() => {
        this.browserClickTimer = null;
        if (clicksIfNoBrowserClick && commit !== this.isOn) {
          this.elements?.input.click();
        }
        this.scheduleReconcile();
      }, BROWSER_CLICK_WAIT_MS);
      return;
    }
    if (commit !== this.isOn) {
      // No click comes from the browser for this lift; the input's own click
      // keeps every native path (form value, onChange, the label).
      this.elements?.input.click();
    }
    this.scheduleReconcile();
  }

  /** If the owner kept the old value, the visuals go back to it. */
  private scheduleReconcile(): void {
    if (this.reconcileTimer != null) {
      clearTimeout(this.reconcileTimer);
    }
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
    this.pressEnded(time, true);
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

  /**
   * The track now shows the new value's fill: the fade layer swaps to the
   * other fill and to the complement of its opacity, so nothing changes on
   * screen, and keeps heading where the visuals head (on the running clock).
   */
  private swapFade(time: number): void {
    const fade = this.fade;
    if (fade == null) {
      return;
    }
    const opacity = fade.get('opacity', time);
    const fadeVelocity = fade.getVelocity('opacity', time);
    this.paintFade();
    fade.rebase({opacity: 1 - 2 * opacity}, {at: time});
    this.animateFade(time, -fadeVelocity);
  }

  /**
   * Holds the track's own fill at the previous value's (the other state's,
   * now) until the fade lands. False when there is nothing to read it from.
   */
  private holdBase(): boolean {
    const track = this.elements?.track;
    const fade = this.fade;
    if (track == null || fade == null || this.otherTrack == null) {
      return false;
    }
    track.style.setProperty(BASE_FILL, readFillOf(track, this.otherTrack));
    this.baseHeld = true;
    const hold = ++this.baseHold;
    void fade.atRest(['opacity']).then(() => {
      if (hold === this.baseHold) {
        this.landBase(now());
      }
    });
    return true;
  }

  /**
   * Ends a held fill: the track shows its value's fill again and the fade
   * layer swaps under it. Landed, the layer is opaque and nothing changes on
   * screen; called early (a new touch, a new value, a new other state), the
   * swap keeps the picture where it is.
   */
  private landBase(time: number): void {
    if (!this.baseHeld) {
      return;
    }
    this.baseHeld = false;
    this.baseHold++;
    this.elements?.track.style.removeProperty(BASE_FILL);
    this.swapFade(time);
  }

  /** The fade layer's colour: the track's fill in its other state. */
  private paintFade(): void {
    const track = this.elements?.track;
    if (track == null || this.fade == null || this.otherTrack == null) {
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

  /** The press began: the switch holds the touch and the thumb lifts. */
  private pressBegan(time: number): void {
    this.pressTime = time;
    this.lift(time);
  }

  /** The press ended (a release, a cancel or the switch turning off). */
  private pressEnded(time: number = now(), touchRelease = false): void {
    this.pressTime = null;
    this.settle(time, touchRelease);
  }

  /**
   * The thumb grows about its center into half the gap around it, and its
   * lifted shadow fades in. Under reduced motion nothing lifts
   * (design:reduced-motion DR1): the lift is feedback with no fade of its own.
   */
  private lift(time: number): void {
    if (this.thumb == null || this.thumb.reducedMotion() !== 'off') {
      return;
    }
    this.liftTime = time;
    const options = {at: time} as const;
    this.thumb.animate(
      {scaleX: this.geometry.liftScaleX, scaleY: this.geometry.liftScaleY},
      {spring: switchControl.lift},
      options,
    );
    this.shadow?.animate({opacity: 1}, {spring: switchControl.lift}, options);
  }

  /**
   * The thumb settles back after the press, no sooner than the minimum lift
   * time after it lifted: one curve per property, built now, so the settle
   * starts on the compositor's clock.
   */
  private settle(time: number, touchRelease: boolean): void {
    const liftTime = this.liftTime;
    if (liftTime == null) {
      return;
    }
    this.liftTime = null;
    // The record's motion roles (spec:AST-094 FR4, DEC-5): the animator
    // resolves each one it is handed.
    const lift = switchControl.lift;
    const settle = switchControl.settle;
    this.settleAt = settleTime(time, liftTime);
    const hold = (this.settleAt - time) / 1000;
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
            lift,
            settle,
          }),
        },
        {at: time, touchRelease},
      );
    };
    play(this.thumb, 'scaleX', this.geometry.liftScaleX, 1, 1e-4);
    play(this.thumb, 'scaleY', this.geometry.liftScaleY, 1, 1e-4);
    play(this.shadow, 'opacity', 1, 0, 1e-3);
  }

  /**
   * The thumb's box changed size with the value (the on circle is larger):
   * its scale carries the size it showed, so nothing jumps, and heads for
   * the new box: back to it through the settle, or to the lift a held press
   * keeps.
   */
  private rescaleThumb(
    before: SwitchTouchGeometry,
    after: SwitchTouchGeometry,
    time: number,
  ): void {
    const thumb = this.thumb;
    if (
      thumb == null ||
      !(before.thumbWidth > 0 && before.thumbHeight > 0) ||
      !(after.thumbWidth > 0 && after.thumbHeight > 0) ||
      (before.thumbWidth === after.thumbWidth &&
        before.thumbHeight === after.thumbHeight)
    ) {
      return;
    }
    const held = this.liftTime != null;
    const hold =
      this.settleAt == null ? 0 : Math.max(0, this.settleAt - time) / 1000;
    for (const [property, factor, lifted] of [
      ['scaleX', before.thumbWidth / after.thumbWidth, before.liftScaleX],
      ['scaleY', before.thumbHeight / after.thumbHeight, before.liftScaleY],
    ] as const) {
      const keep = lifted * factor;
      thumb.play(
        {
          [property]: liftThenSettle({
            from: thumb.get(property, time) * factor,
            velocity: thumb.getVelocity(property, time) * factor,
            lifted: keep,
            rest: held ? keep : 1,
            holdSeconds: held ? 0 : hold,
            threshold: 1e-4,
            lift: switchControl.lift,
            settle: switchControl.settle,
          }),
        },
        {at: time},
      );
    }
  }

  private clearTimers(): void {
    if (this.browserClickTimer != null) {
      clearTimeout(this.browserClickTimer);
      this.browserClickTimer = null;
    }
    if (this.reconcileTimer != null) {
      clearTimeout(this.reconcileTimer);
      this.reconcileTimer = null;
    }
  }
}

/**
 * Switch's gestures, attached for every pointer (`spec:AST-094` FR43), with
 * the touch presentation under a coarse primary pointer (FR13). Its parts
 * must be rendered (and styled for it) whether or not it is active; it only
 * animates and listens.
 */
export function useSwitchTouch(
  parts: SwitchTouchParts,
  {
    isOn,
    isInteractive,
    isDisabled,
    trackSize,
    otherTrackProps,
  }: SwitchTouchOptions,
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
    // A disabled switch takes no press: no listener is active (spec:AST-094
    // FR24). A busy one stays attached (setInteractive ignores its presses),
    // so the change that made it busy keeps its motion.
    if (
      isDisabled ||
      surface == null ||
      input == null ||
      thumb == null ||
      track == null
    ) {
      return undefined;
    }
    controller.attach(
      {surface, input, thumb, track},
      isTouch ? 'touch' : 'pointer',
    );
    return () => controller.detach();
  }, [controller, isTouch, isDisabled, parts]);
}
