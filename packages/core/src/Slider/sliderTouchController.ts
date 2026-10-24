// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sliderTouchController.ts
 * @input The slider's control, thumbs, thumb touch targets and fill parts;
 *   its value model (Slider.tsx); the gesture recognizers (PressTracker,
 *   PanGestureRecognizer, TapGestureRecognizer), the motion animator and the
 *   UIKit constants table (motion/uikit, `slider`)
 * @output Exports `SliderTouchController` (UISlider's touch tracking),
 *   `sliderCoastCurve` (the release coast as a closed-form curve) and the
 *   `SliderTouchModel` and `SliderTouchParts` types
 * @position Internal to Slider: its touch presentation (a finger, or a pen
 *   on a thumb, under a coarse primary pointer: one touch model on every
 *   touch device, spec:AST-094), loaded by useSliderTouch only once that
 *   presentation applies. A mouse or a trackpad keeps Slider's own pointer
 *   handlers. The coast
 *   spring is the `slider.releaseSpring` motion role, resolved under the
 *   thumb's theme.
 *
 * WHAT A FINGER DOES (UISlider, iOS 26.2; values and sources in
 * motion/uikit/slider.ts)
 *
 * - Only the thumb takes a finger: each thumb carries an invisible square
 *   touch target (`slider.thumbHitTarget`) holding a PressTracker (UIControl's
 *   tracking: touch-down, inside / outside, up, cancel) and a pan recognizer
 *   along the travel. A swipe from the track scrolls the page. A tap on the
 *   track or a mark (lifted before the pan's 10 px) sets the value on its lift
 *   and springs the thumb there: UISlider ignores the tap, but a drag must not
 *   be the only pointer way to set the value (WCAG 2.2 SC 2.5.7,
 *   spec:AST-020 FR9).
 * - Touch-down lifts the thumb (`slider.liftScale` on `slider.liftSpring`),
 *   after the scroller's content delay inside one, and paints it pressed.
 * - The pan begins after its hysteresis (10 px along the travel); a drag
 *   across the travel fails it, and the browser scrolls. From then on the
 *   value is the value when the pan began plus the finger's travel past the
 *   threshold over the track's length (`slider.trackingGain`), snapped to
 *   the step and
 *   clamped: the thumb lags the finger and never jumps to it, and a finger
 *   that overshoots an end must come back past it before the value moves.
 *   `onChange` fires only when the value changes; the thumb and the fill
 *   follow the owner's render, which moves them by `translate` (no layout).
 * - The lift drops the thumb (`slider.dropSpring`) and coasts: the value
 *   springs on `slider.releaseSpring` from the lift value, with the release
 *   velocity, to the lift value plus `slider.releaseProjectionShare` of the
 *   momentum projection, or back to the lift value when the finger lifted
 *   outside the control's tracking bounds. The coast plays on the compositor
 *   (`Animator.play` on the thumb and the fill parts, one clock), clamped at
 *   the ends of the thumb's range; `onChange` follows it from the fourth
 *   frame (the hand-off). Its last frame ends the interaction: the owner
 *   renders the final value at once (synchronously, from that handler), the
 *   parts return to the stylesheet and `onChangeEnd` reports the rendered
 *   value. A finger landing on a coasting thumb stops it where it is.
 * - Reaching an end plays `slider.endHaptic` once per entry, during the drag
 *   and the coast, where the browser can vibrate.
 * - Under Reduce Motion (`design:reduced-motion`) the thumb does not lift (the
 *   press shows in its paint), and the animator turns a release's coast and a
 *   tap's spring into an opacity-only cross-fade of 200 ms to the same value.
 *   The finger's own tracking is direct movement and stays.
 * - A pan along the travel that starts on a thumb is the slider's: ancestor
 *   pans and swipes along that axis are vetoed for it (UISlider's
 *   `gestureRecognizerShouldBegin`), so a pager or a swipe row does not take
 *   it. Across the axis they keep it.
 * - Two coincident range thumbs: the thumb on top takes the finger, and the
 *   drag's first movement hands it to the thumb that can move that way.
 *
 * The pan claims its touch with a blocking `touchmove` listener once it
 * moves along the travel, as any mid-gesture claimer does; the wait is the
 * listener's own run, and the drag's work per move is one `onChange`.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Slider/useSliderTouch.ts (the lazy wiring)
 * - /packages/core/src/Slider/Slider.tsx (touch targets, model, commit)
 * - /packages/core/src/Slider/useSliderTouch.test.ts
 * - /packages/core/src/Slider/__tests__/SliderTouch.interaction.browser.spec.ts
 */

import {getGestureHost} from '../gestures/GestureHost';
import type {GestureRecognizer} from '../gestures/GestureRecognizer';
import {playHaptic} from '../gestures/haptics';
import {PanGestureRecognizer} from '../gestures/PanGestureRecognizer';
import {
  PRESS_PROFILES,
  PressTracker,
  type ControlEvent,
} from '../gestures/PressTracker';
import {SwipeGestureRecognizer} from '../gestures/SwipeGestureRecognizer';
import {TapGestureRecognizer} from '../gestures/TapGestureRecognizer';
import type {PointerKind} from '../gestures/types';
import {isRtlElement} from '../hooks/isRtlElement';
import {
  createAnimator,
  type Animator,
  type MotionCurve,
  type MotionHandle,
} from '../motion/animator';
import {projectDistance} from '../motion/projection';
import {resolveMotion} from '../motion/resolveMotion';
import {solveSpring, toSpring, type SpringDescription} from '../motion/spring';
import {UIKIT_GESTURES} from '../motion/uikit/gestures';
import {slider as UIKIT_SLIDER} from '../motion/uikit/slider';

/** Frames of a coast before it reports values (the touch hand-off limit). */
const HAND_OFF_FRAMES = 3;

/** A coast shorter than this (px) and slower than 1 px/s is not played. */
const MIN_COAST_PX = 0.5;

/** The parts the controller moves. */
export interface SliderTouchParts {
  readonly control: HTMLElement;
  readonly thumbs: ReadonlyArray<HTMLElement>;
  /** The thumbs' touch targets, in thumb order. */
  readonly hits: ReadonlyArray<HTMLElement>;
  /** The fill's mover (a range's start) and the fill itself. */
  readonly fillMover: HTMLElement | null;
  readonly fill: HTMLElement | null;
}

/** What the controller needs from Slider; read fresh on every use. */
export interface SliderTouchModel {
  readonly min: number;
  readonly max: number;
  readonly isRange: boolean;
  readonly isHorizontal: boolean;
  readonly isDisabled: boolean;
  /** The thumb's size along the travel, px: the travel is inset by half of it. */
  readonly thumbSize: number;
  /** The values the owner rendered. */
  values(): ReadonlyArray<number>;
  /** What thumb `index` becomes for `raw`: snapped, clamped, kept apart. */
  constrain(index: number, raw: number): number;
  /** The range thumb `index` may cover, unsnapped (its ends and the gap). */
  bounds(index: number): readonly [number, number];
  /** `onChange` for thumb `index`. */
  change(index: number, value: number): void;
  /** Thumb `index` is under a finger (pressed paint, focus, tooltip), or none. */
  press(index: number | null): void;
  /**
   * The interaction ended: report thumb `index`'s last `value` through
   * `onChange` (null when the end changed nothing), release the pressed
   * paint, and have the owner render it all now, synchronously, so the parts
   * can return to the stylesheet and `onChangeEnd` can carry what the owner
   * rendered.
   */
  commit(index: number, value: number | null): void;
  /** `onChangeEnd`, with the values the owner rendered (FR5). */
  reportEnd(): void;
  /**
   * The value a press at client point (`x`, `y`) on the track means: a
   * mark's value on a mark, else the point along the travel.
   */
  valueAt(x: number, y: number): number;
  /** The thumb a track press at `value` moves. */
  thumbFor(value: number): number;
}

/** The travel's geometry, read once when a finger lands. */
interface Geometry {
  /** The track's length along the travel, CSS px. */
  readonly length: number;
  /** The thumb's travel: the track minus one thumb. */
  readonly travel: number;
  readonly axis: 'x' | 'y';
  /** Screen direction of increasing value along `axis`. */
  readonly sign: 1 | -1;
  /** The control's client rect, for the release's inside test. */
  readonly rect: DOMRect;
}

interface Coast {
  readonly handles: ReadonlyArray<MotionHandle>;
  readonly target: number;
  frames: number;
  raf: number;
}

interface Interaction {
  /** The thumb whose touch target holds the finger. */
  readonly owner: number;
  /** The thumb whose value moves (a coincident pair may hand it over). */
  index: number;
  readonly geometry: Geometry;
  /** The value when the pan began; null until it does. */
  startValue: number | null;
  /** Which way along the axis the pan began (its threshold's side). */
  beganSign: 1 | -1;
  /** The last value reported (or rendered when the finger landed). */
  value: number;
  /** Whether the finger is inside the control's tracking bounds. */
  isInside: boolean;
  /** The end the value sits at, for the once-per-entry haptic. */
  atEnd: 'min' | 'max' | null;
  /** The value changed during this interaction. */
  changed: boolean;
  coast: Coast | null;
  /** The pan ended or was cancelled (the release is under way or done). */
  released: boolean;
}

/**
 * The release coast as a curve in the thumb's own px, clamped to the
 * thumb's range: a spring from `from` to `to` with `velocity` (px/s), whose
 * value stops at an end instead of passing it (UISlider clamps its value;
 * the thumb follows the value).
 */
export function sliderCoastCurve({
  from,
  to,
  velocity,
  lower,
  upper,
  spring: description = UIKIT_SLIDER.releaseSpring,
}: {
  from: number;
  to: number;
  velocity: number;
  lower: number;
  upper: number;
  /** The release spring, as the thumb's theme resolves it. */
  spring?: SpringDescription;
}): MotionCurve {
  const spring = solveSpring(toSpring(description), {
    from,
    to,
    velocity,
  });
  const lo = Math.min(lower, upper);
  const hi = Math.max(lower, upper);
  const duration = Math.min(Math.max(spring.settleTime(0.05), 1 / 120), 3);
  return {
    duration,
    at: t => (t >= duration ? to : Math.min(Math.max(spring.value(t), lo), hi)),
    velocity: t => {
      if (t >= duration) {
        return 0;
      }
      const value = spring.value(t);
      return value <= lo || value >= hi ? 0 : spring.velocity(t);
    },
  };
}

/** UISlider's touch tracking for one Slider (both thumbs of a range). */
export class SliderTouchController {
  private model: SliderTouchModel;
  private readonly getParts: () => SliderTouchParts | null;
  private readonly interactions = new Map<number, Interaction>();
  private readonly animators = new Map<HTMLElement, Animator>();
  /** Thumbs whose current touch is a mouse: Slider's own handlers take it. */
  private readonly mouseOwners = new Set<number>();
  /** The track's tap (see handleTrackTap); null while detached. */
  private trackTap: TapGestureRecognizer | null = null;

  constructor(
    model: SliderTouchModel,
    getParts: () => SliderTouchParts | null,
  ) {
    this.model = model;
    this.getParts = getParts;
  }

  setModel(model: SliderTouchModel): void {
    this.model = model;
  }

  /** Attaches the recognizers to the touch targets in the DOM now. */
  attach(): () => void {
    const parts = this.getParts();
    if (parts == null || parts.hits.length === 0) {
      return () => {};
    }
    const host = getGestureHost(parts.control.ownerDocument);
    const detachers: (() => void)[] = [];
    parts.hits.forEach((hit, owner) => {
      const tracker = new PressTracker({
        getBounds: () =>
          this.getParts()?.control.getBoundingClientRect() ?? null,
        view: hit,
        highlightDelay: PRESS_PROFILES.control.highlightDelay,
        quickTapFlash: PRESS_PROFILES.control.quickTapFlash,
        onControlEvent: (event, touch) =>
          this.handleControlEvent(owner, event, touch.pointerType),
        onHighlightChange: isHighlighted =>
          this.handleHighlight(owner, isHighlighted),
        vetoesAncestorRecognizer: recognizer => this.vetoes(recognizer),
        isEnabled: () => !this.model.isDisabled,
      });
      const pan = new PanGestureRecognizer({
        name: `slider-thumb-${owner}`,
        direction: this.model.isHorizontal ? 'horizontal' : 'vertical',
        maximumNumberOfTouches: 1,
        cancelsTouchesInView: false,
        allowedPointerTypes: ['touch', 'pen'],
        // A held finger never starts a text selection or the callout on the
        // thumb (the gesture host's lock, restored on the lift).
        preventsTextSelection: true,
      });
      const removeListener = pan.addListener(current =>
        this.handlePan(owner, current),
      );
      detachers.push(
        host.attachConsumer(hit, tracker),
        host.attach(hit, pan),
        removeListener,
        () => tracker.dispose(),
      );
    });
    // A tap on the track (or a mark) sets the value when it lifts, so a drag
    // is not the only pointer way to operate the slider (WCAG 2.2 SC 2.5.7,
    // spec:AST-020 FR9). UISlider ignores track taps; this departs from it.
    // A touch that moves past the tap's allowance, or that the page takes to
    // scroll, is no tap.
    const tap = new TapGestureRecognizer({
      name: 'slider-track-tap',
      allowedPointerTypes: ['touch', 'pen'],
      cancelsTouchesInView: false,
      // A touch that travels as far as a thumb's pan needs to begin is a
      // swipe, not a tap (UITapGestureRecognizer would allow 45 pt).
      allowableMovement: UIKIT_GESTURES.pan.hysteresis.value,
      // Nor does a finger held on the track start a selection.
      preventsTextSelection: true,
    });
    this.trackTap = tap;
    const removeTapListener = tap.addListener(current => {
      if (current.state === 'ended') {
        this.handleTrackTap(current);
      }
    });
    detachers.push(host.attach(parts.control, tap), removeTapListener, () => {
      this.trackTap = null;
    });
    return () => {
      // Interactions end silently first, so the cancel the recognizers send
      // as they detach finds nothing left to report.
      this.endSilently();
      for (const detach of detachers) {
        detach();
      }
    };
  }

  /** Stops every interaction and animation without reporting (unmount). */
  dispose(): void {
    this.endSilently();
    for (const animator of this.animators.values()) {
      animator.dispose();
    }
    this.animators.clear();
  }

  /**
   * Ends every live interaction without a word to the owner: the Slider is
   * unmounting or stops taking touches, from an Effect cleanup, where
   * `onChange`, `onChangeEnd` and a synchronous render have no place
   * (`architecture:react-component-runtime` INV2). A coast stops where it
   * is and the parts return to the stylesheet, at the value the owner last
   * rendered.
   */
  private endSilently(): void {
    if (this.interactions.size === 0) {
      return;
    }
    const view = this.getParts()?.control.ownerDocument.defaultView;
    for (const interaction of this.interactions.values()) {
      const coast = interaction.coast;
      if (coast != null) {
        interaction.coast = null;
        view?.cancelAnimationFrame(coast.raf);
        for (const handle of coast.handles) {
          handle.stop();
        }
      }
      interaction.released = true;
    }
    this.interactions.clear();
    this.mouseOwners.clear();
    this.handBack();
  }

  /**
   * After the owner rendered an ended interaction's final value: the thumb
   * and the fill go back to the positions Slider's CSS gives them (parts a
   * coast of another thumb still drives stay with it).
   */
  private handBack(): void {
    for (const [element, animator] of this.animators) {
      if (
        [...this.interactions.values()].some(
          interaction =>
            interaction.coast != null && this.partsOf(interaction).has(element),
        )
      ) {
        continue;
      }
      // Ends the animator's translate at identity, then removes the inline
      // property, so the class's progress-driven translate shows again.
      animator.set({x: 0, y: 0});
      element.style.removeProperty('translate');
      // A Reduced Motion cross-fade wrote the opacity: end it at 1 and hand it
      // back too (a caught fade stops part-way).
      if (element.style.getPropertyValue('opacity') !== '') {
        animator.set({opacity: 1});
        element.style.removeProperty('opacity');
      }
    }
  }

  // -- events ----------------------------------------------------------------

  private handleControlEvent(
    owner: number,
    event: ControlEvent,
    pointerType: PointerKind,
  ): void {
    if (event === 'touchDown') {
      if (pointerType === 'mouse') {
        this.mouseOwners.add(owner);
        return;
      }
      this.mouseOwners.delete(owner);
      this.begin(owner);
      return;
    }
    if (this.mouseOwners.has(owner)) {
      if (
        event === 'touchUpInside' ||
        event === 'touchUpOutside' ||
        event === 'touchCancel'
      ) {
        this.mouseOwners.delete(owner);
      }
      return;
    }
    const interaction = this.interactions.get(owner);
    if (interaction == null) {
      return;
    }
    switch (event) {
      case 'touchDragInside':
      case 'touchDragEnter':
        interaction.isInside = true;
        return;
      case 'touchDragOutside':
      case 'touchDragExit':
        interaction.isInside = false;
        return;
      case 'touchUpInside':
      case 'touchUpOutside':
        interaction.isInside = event === 'touchUpInside';
        // A press that never became a pan ends here (a tap or a hold).
        if (interaction.startValue == null) {
          this.finish(interaction, true);
        }
        return;
      case 'touchCancel':
        // The browser took the touch to scroll, or the press was cancelled
        // before the pan began; a begun pan reports its own cancel.
        if (interaction.startValue == null) {
          this.finish(interaction, false);
        }
        return;
      default:
        return;
    }
  }

  private handleHighlight(owner: number, isHighlighted: boolean): void {
    if (this.mouseOwners.has(owner)) {
      return;
    }
    const interaction = this.interactions.get(owner);
    const index = interaction?.index ?? owner;
    if (isHighlighted && interaction != null && !interaction.released) {
      this.lift(index);
    } else if (!isHighlighted && interaction == null) {
      this.drop(index);
    }
  }

  private handlePan(owner: number, pan: PanGestureRecognizer): void {
    const interaction = this.interactions.get(owner);
    if (interaction == null || interaction.released) {
      return;
    }
    switch (pan.state) {
      case 'began':
        interaction.startValue = interaction.value;
        interaction.beganSign =
          pan.totalTranslation()[interaction.geometry.axis] < 0 ? -1 : 1;
        this.lift(interaction.index);
        this.track(interaction, pan);
        return;
      case 'changed':
        this.track(interaction, pan);
        return;
      case 'ended':
        interaction.released = true;
        this.release(interaction, pan);
        return;
      case 'cancelled':
        interaction.released = true;
        this.finish(interaction, true);
        return;
      case 'possible':
      case 'failed':
        return;
    }
  }

  /** UISlider's veto: an ancestor's pan or swipe along the travel. */
  private vetoes(recognizer: GestureRecognizer): boolean {
    // A touch on a thumb is the thumb's: a tap there changes nothing.
    if (recognizer === this.trackTap) {
      return true;
    }
    const horizontal = this.model.isHorizontal;
    if (recognizer instanceof SwipeGestureRecognizer) {
      return recognizer.directions.some(direction =>
        horizontal
          ? direction === 'left' || direction === 'right'
          : direction === 'up' || direction === 'down',
      );
    }
    if (recognizer instanceof PanGestureRecognizer) {
      const {x, y} = recognizer.translation();
      return horizontal
        ? Math.abs(x) >= Math.abs(y)
        : Math.abs(y) >= Math.abs(x);
    }
    return false;
  }

  // -- the interaction -------------------------------------------------------

  private begin(owner: number): void {
    const parts = this.getParts();
    if (parts == null || this.model.isDisabled) {
      return;
    }
    // A finger on a coasting thumb stops it where it is.
    for (const other of [...this.interactions.values()]) {
      if (other.coast != null) {
        this.stopCoast(other);
        this.finish(other, true);
      }
    }
    const geometry = this.measure(parts);
    const value = this.model.values()[owner] ?? this.model.min;
    this.interactions.set(owner, {
      owner,
      index: owner,
      geometry,
      startValue: null,
      beganSign: 1,
      value,
      isInside: true,
      atEnd: this.endOf(value),
      changed: false,
      coast: null,
      released: false,
    });
    this.model.press(owner);
  }

  private track(interaction: Interaction, pan: PanGestureRecognizer): void {
    const {geometry} = interaction;
    const {min, max, isRange} = this.model;
    // UISlider counts the translation from the threshold itself (the
    // touch-down point plus the hysteresis along the axis), so the travel
    // of the event that crossed it already counts.
    const translation =
      (pan.totalTranslation()[geometry.axis] -
        interaction.beganSign * pan.hysteresis) *
      geometry.sign;
    const startValue = interaction.startValue ?? interaction.value;
    const raw =
      startValue +
      (translation / geometry.length) * (max - min) * UIKIT_SLIDER.trackingGain;
    // Coincident range thumbs: the first movement picks the thumb that can
    // follow it (the one on top cannot pass the other).
    if (isRange && !interaction.changed && raw !== startValue) {
      const values = this.model.values();
      if (values[0] === values[1]) {
        const index = raw < startValue ? 0 : 1;
        if (index !== interaction.index) {
          this.drop(interaction.index);
          interaction.index = index;
          this.lift(index);
          this.model.press(index);
        }
      }
    }
    this.report(interaction, this.model.constrain(interaction.index, raw));
  }

  /**
   * Records a new value and plays the end haptic on entering an end;
   * reports it through `onChange` unless the interaction's end commits it.
   * Returns whether the value changed.
   */
  private record(
    interaction: Interaction,
    value: number,
    {commits = false}: {commits?: boolean} = {},
  ): boolean {
    if (value === interaction.value) {
      return false;
    }
    interaction.value = value;
    interaction.changed = true;
    if (!commits) {
      this.model.change(interaction.index, value);
    }
    const end = this.endOf(value);
    if (end != null && end !== interaction.atEnd) {
      playHaptic(UIKIT_SLIDER.endHaptic);
    }
    interaction.atEnd = end;
    return true;
  }

  private report(interaction: Interaction, value: number): void {
    this.record(interaction, value);
  }

  private release(interaction: Interaction, pan: PanGestureRecognizer): void {
    const {geometry, index} = interaction;
    const {min, max} = this.model;
    const range = max - min;
    this.drop(index);
    this.model.press(null);
    const location = pan.location();
    const expansion = UIKIT_GESTURES.control.trackingExpansion.value;
    const inside =
      location.x >= geometry.rect.left - expansion &&
      location.x <= geometry.rect.right + expansion &&
      location.y >= geometry.rect.top - expansion &&
      location.y <= geometry.rect.bottom + expansion;
    interaction.isInside = inside;
    // Finger velocity along increasing value, px/s.
    const velocity = pan.velocity()[geometry.axis] * geometry.sign;
    const projected = inside
      ? UIKIT_SLIDER.releaseProjectionShare *
        projectDistance(velocity, UIKIT_SLIDER.releaseProjectionRate)
      : 0;
    const from = interaction.value;
    const target = this.model.constrain(
      index,
      from + (projected / geometry.length) * range * UIKIT_SLIDER.trackingGain,
    );
    // In the thumb's px: the value's velocity mapped onto the travel.
    const pxPerValue = range > 0 ? geometry.travel / range : 0;
    const valueVelocity =
      (velocity / geometry.length) * range * UIKIT_SLIDER.trackingGain;
    this.coastTo(interaction, target, valueVelocity * pxPerValue, true);
  }

  /**
   * A tap on the track: the thumb the tap's value picks springs there (the
   * release spring, from rest), reporting as a coast does, and
   * `onChangeEnd` follows. A tap on the thumb's own value changes nothing.
   */
  private handleTrackTap(tap: TapGestureRecognizer): void {
    const parts = this.getParts();
    if (parts == null || this.model.isDisabled || this.interactions.size > 0) {
      return;
    }
    const {x, y} = tap.location();
    const raw = this.model.valueAt(x, y);
    const index = this.model.thumbFor(raw);
    const target = this.model.constrain(index, raw);
    const value = this.model.values()[index] ?? this.model.min;
    if (target === value) {
      return;
    }
    const interaction: Interaction = {
      owner: index,
      index,
      geometry: this.measure(parts),
      startValue: null,
      beganSign: 1,
      value,
      isInside: true,
      atEnd: this.endOf(value),
      changed: false,
      coast: null,
      released: true,
    };
    this.interactions.set(index, interaction);
    this.coastTo(interaction, target, 0, false);
  }

  /**
   * Springs the interaction's thumb from its value to `target`, starting at
   * `velocityPx` (px/s along the travel), on the compositor and clamped:
   * `onChange` follows from the coast's fourth frame and the interaction
   * ends (`onChangeEnd`) on its last. `touchRelease`: a finger's release
   * started it. Under Reduce Motion the animator replaces the spring with an
   * opacity-only cross-fade (design:reduced-motion DR2).
   */
  private coastTo(
    interaction: Interaction,
    target: number,
    velocityPx: number,
    touchRelease: boolean,
  ): void {
    const {geometry, index} = interaction;
    const {min, max} = this.model;
    const range = max - min;
    const pxPerValue = range > 0 ? geometry.travel / range : 0;
    const from = interaction.value;
    const fromPx = (from - min) * pxPerValue;
    const toPx = (target - min) * pxPerValue;
    const [lowerValue, upperValue] = this.model.bounds(index);
    const curve = sliderCoastCurve({
      from: fromPx,
      to: toPx,
      velocity: velocityPx,
      lower: (lowerValue - min) * pxPerValue,
      upper: (upperValue - min) * pxPerValue,
      // A theme may retune the coast (`slider.releaseSpring`).
      spring: resolveMotion(
        this.getParts()?.control,
        UIKIT_SLIDER.releaseSpring,
      ),
    });
    const moves =
      Math.abs(toPx - fromPx) >= MIN_COAST_PX ||
      Math.max(Math.abs(curve.at(0.05) - fromPx), 0) >= MIN_COAST_PX;
    if (!moves) {
      this.finish(interaction, true, target);
      return;
    }
    const handles = this.playCoast(interaction, curve, touchRelease);
    if (handles.length === 0) {
      this.finish(interaction, true, target);
      return;
    }
    const coast: Coast = {handles, target, frames: 0, raf: 0};
    interaction.coast = coast;
    const thumbHandle = handles[0];
    const view = this.getParts()?.control.ownerDocument.defaultView;
    const step = () => {
      if (interaction.coast !== coast) {
        return;
      }
      coast.frames += 1;
      if (coast.frames > HAND_OFF_FRAMES) {
        const px = Math.abs(thumbHandle.value(geometry.axis));
        const value =
          pxPerValue > 0 ? min + px / pxPerValue : interaction.value;
        this.report(interaction, this.model.constrain(index, value));
      }
      coast.raf = view?.requestAnimationFrame(step) ?? 0;
    };
    coast.raf = view?.requestAnimationFrame(step) ?? 0;
    void thumbHandle.finished.then(finished => {
      if (interaction.coast !== coast || !finished) {
        return;
      }
      view?.cancelAnimationFrame(coast.raf);
      interaction.coast = null;
      this.finish(interaction, true, coast.target);
    });
  }

  /** Plays the coast on the thumb and the fill parts, on one clock. */
  private playCoast(
    interaction: Interaction,
    curve: MotionCurve,
    touchRelease: boolean,
  ): MotionHandle[] {
    const parts = this.getParts();
    if (parts == null) {
      return [];
    }
    const {geometry, index} = interaction;
    const {axis, sign, length, travel} = geometry;
    const inset = this.model.thumbSize / 2;
    const values = this.model.values();
    const {min, max, isRange} = this.model;
    const range = max - min;
    const pxPerValue = range > 0 ? travel / range : 0;
    const otherPx = ((values[index === 0 ? 1 : 0] ?? min) - min) * pxPerValue;
    // Each part's translate is linear in the moving thumb's px (`p`), the
    // same formulas as Slider's CSS, so each curve is that map of `curve`.
    const map = (
      element: HTMLElement | null | undefined,
      at: (p: number) => number,
      slope: number,
    ): [HTMLElement, MotionCurve] | null =>
      element == null
        ? null
        : [
            element,
            {
              duration: curve.duration,
              at: t => sign * at(curve.at(t)),
              velocity: t => sign * slope * curve.velocity(t),
            },
          ];
    const entries: ([HTMLElement, MotionCurve] | null)[] = [
      map(parts.thumbs[index], p => p, 1),
    ];
    if (isRange) {
      if (index === 0) {
        entries.push(
          map(parts.fillMover, p => inset + p, 1),
          map(parts.fill, p => otherPx - p - length, -1),
        );
      } else {
        entries.push(map(parts.fill, p => p - otherPx - length, 1));
      }
    } else {
      entries.push(map(parts.fill, p => inset + p - length, 1));
    }
    const at = performance.now();
    const handles: MotionHandle[] = [];
    for (const entry of entries) {
      if (entry == null) {
        continue;
      }
      const [element, partCurve] = entry;
      const animator = this.animatorFor(element);
      animator.set({[axis]: partCurve.at(0)});
      handles.push(animator.play({[axis]: partCurve}, {at, touchRelease}));
    }
    return handles;
  }

  private stopCoast(interaction: Interaction): void {
    const coast = interaction.coast;
    if (coast == null) {
      return;
    }
    interaction.coast = null;
    this.getParts()?.control.ownerDocument.defaultView?.cancelAnimationFrame(
      coast.raf,
    );
    const {geometry, index} = interaction;
    const {min, max} = this.model;
    const px = Math.abs(coast.handles[0]?.value(geometry.axis) ?? 0);
    for (const handle of coast.handles) {
      handle.stop();
    }
    const range = max - min;
    if (range > 0 && geometry.travel > 0) {
      this.report(
        interaction,
        this.model.constrain(index, min + (px / geometry.travel) * range),
      );
    }
  }

  /**
   * Ends an interaction from the handler that ends it (the lift, the cancel,
   * the coast's last frame): the owner renders the last value at once, the
   * parts return to the stylesheet, and `onChangeEnd` reports what the owner
   * rendered, unless the browser took the touch before any drag (`report`
   * false).
   */
  private finish(
    interaction: Interaction,
    report: boolean,
    finalValue: number | null = null,
  ): void {
    if (this.interactions.get(interaction.owner) !== interaction) {
      return;
    }
    this.interactions.delete(interaction.owner);
    if (!interaction.released) {
      this.drop(interaction.index);
    }
    interaction.released = true;
    const changed =
      finalValue != null &&
      this.record(interaction, finalValue, {commits: true});
    this.model.commit(interaction.index, changed ? finalValue : null);
    this.handBack();
    if (report) {
      this.model.reportEnd();
    }
  }

  // -- the thumb's lift --------------------------------------------------------

  private lift(index: number): void {
    const thumb = this.getParts()?.thumbs[index];
    if (thumb == null) {
      return;
    }
    const animator = this.animatorFor(thumb);
    // The lift is feedback with no fade of its own: under Reduce Motion the
    // press shows in the pressed paint alone, and a change of state never
    // scales (design:reduced-motion DR1).
    if (animator.reducedMotion() !== 'off') {
      return;
    }
    animator.animate(
      {scale: UIKIT_SLIDER.liftScale},
      {spring: UIKIT_SLIDER.liftSpring},
    );
  }

  private drop(index: number): void {
    const thumb = this.getParts()?.thumbs[index];
    if (thumb == null) {
      return;
    }
    const animator = this.animators.get(thumb);
    if (animator == null || animator.get('scale') === 1) {
      return;
    }
    animator.animate({scale: 1}, {spring: UIKIT_SLIDER.dropSpring});
  }

  // -- helpers -----------------------------------------------------------------

  private measure(parts: SliderTouchParts): Geometry {
    const {control} = parts;
    const horizontal = this.model.isHorizontal;
    // The layout size (unrounded, untransformed): the size the CSS's
    // container units resolve against.
    const style = control.ownerDocument.defaultView?.getComputedStyle(control);
    const rect = control.getBoundingClientRect();
    const used = (horizontal ? style?.width : style?.height) ?? '';
    const length = used.endsWith('px')
      ? parseFloat(used)
      : horizontal
        ? rect.width
        : rect.height;
    return {
      length,
      travel: Math.max(0, length - this.model.thumbSize),
      axis: horizontal ? 'x' : 'y',
      sign: horizontal ? (isRtlElement(control) ? -1 : 1) : -1,
      rect,
    };
  }

  private endOf(value: number): 'min' | 'max' | null {
    if (value <= this.model.min) {
      return 'min';
    }
    if (value >= this.model.max) {
      return 'max';
    }
    return null;
  }

  private animatorFor(element: HTMLElement): Animator {
    let animator = this.animators.get(element);
    if (animator == null) {
      animator = createAnimator(element);
      this.animators.set(element, animator);
    }
    return animator;
  }

  private partsOf(interaction: Interaction): Set<HTMLElement> {
    const parts = this.getParts();
    const set = new Set<HTMLElement>();
    if (parts == null) {
      return set;
    }
    const thumb = parts.thumbs[interaction.index];
    for (const element of [thumb, parts.fillMover, parts.fill]) {
      if (element != null) {
        set.add(element);
      }
    }
    return set;
  }
}
