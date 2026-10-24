// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file keyboardModel.ts
 * @input `springs.keyboard`, `timing.keyboardNotificationMs` and `keyboard`
 *   from the UIKit table
 * @output Exports createKeyboardModel (the keyboard layout guide's clock-free
 *   core) and the KeyboardTransition / KeyboardModel types
 * @position The state of the keyboard layout guide (keyboardLayoutGuide.ts):
 *   which transition the keyboard is in, inferred from the visual viewport's
 *   reports and focus changes, each input carrying its own time. Internal to
 *   core
 *
 * Mobile Safari reports the keyboard late and once (README.md, "What the
 * page sees"):
 *
 * - Show: the viewport's one `resize` arrives about `keyboard.showReportLagMs`
 *   after the keyboard started to rise, and later when the main thread was
 *   busy: the report waits for it, and the keyboard then started at about
 *   the last frame the page rendered before the report. The model dates the
 *   show back to the earlier of the two (never more than
 *   `keyboard.showReportLagMaxMs`), so content following the keyboard joins
 *   its spring where the keyboard is.
 * - Hide: the `resize` arrives once the keyboard is down. The keyboard starts
 *   to fall `keyboard.hideAfterBlurMs` after the focused control loses focus
 *   to nothing that brings up a keyboard, so the model starts the hide from
 *   the blur (a prediction) and takes the late `resize` as its confirmation.
 *   A prediction the viewport has not confirmed once it should have ended
 *   gives way to what the viewport says (`verify`).
 * - A change while the keyboard is up (a field that brings up the number
 *   pad) jumps: UIKit posts it with a zero duration.
 *
 * Chrome (the `chromium` profile) reports the keyboard at the start of its
 * slide, once per change, whether through the visual viewport or the
 * VirtualKeyboard API: a transition starts at its report, plays the Android
 * table's curve (`androidKeyboard`), nothing is dated back or predicted, and a
 * second report while one plays (Chrome's accessory bar, then the keyboard)
 * continues from where the first one is.
 *
 * SYNC: When modified, update /packages/core/src/keyboard/README.md
 */

import {keyboard, springs, timing} from '../motion/uikit';
import {keyboard as androidKeyboard} from '../motion/android';
import {cubicBezier} from '../motion/bezier';
import {solveSpring, toSpring} from '../motion/spring';

/** Which browser's keyboard reports the model reads. */
export type KeyboardProfile = 'webkit' | 'chromium';

/**
 * An eased slide: the curve a transition plays instead of UIKit's keyboard
 * spring (Android's keyboard).
 */
export interface KeyboardCurve {
  /** Length, ms. */
  readonly durationMs: number;
  /** Cubic-bézier control points. */
  readonly points: readonly [number, number, number, number];
  /** Which of the Android table's durations it is, for a theme to retune. */
  readonly durationKey: 'showMs' | 'hideMs';
}

/** How the keyboard's cover changes. */
export type KeyboardTransitionKind = 'show' | 'hide' | 'change';

/** One change of the keyboard's cover, as the guide reports it. */
export interface KeyboardTransition {
  readonly kind: KeyboardTransitionKind;
  /** Inset presented at `start`, CSS px. */
  readonly from: number;
  /** Inset the keyboard comes to rest at, CSS px. */
  readonly to: number;
  /**
   * When the keyboard starts to move, ms on the document timeline
   * (`performance.now()` clock): in the past for a show Safari reported late,
   * shortly ahead for a hide that starts after a blur.
   */
  readonly start: number;
  /** The inset's velocity at `start`, px/s (0 unless it interrupts one). */
  readonly velocity: number;
  /** False when the inset jumps at `start`, as UIKit's zero-duration changes. */
  readonly animated: boolean;
  /** True until the visual viewport confirms a transition the guide inferred. */
  readonly predicted: boolean;
  /**
   * The eased curve the keyboard slides on (Android), or null when it moves
   * on UIKit's keyboard spring (`springs.keyboard`).
   */
  readonly curve: KeyboardCurve | null;
}

/** Timing of the keyboard as the page sees it; the UIKit table's by default. */
export interface KeyboardModelOptions {
  /** How long after the keyboard starts to rise the viewport reports it, ms. */
  showReportLagMs?: number;
  /** The furthest a show is dated back to the frame before its report, ms. */
  showReportLagMaxMs?: number;
  /** How long after the blur the keyboard starts to fall, ms. */
  hideAfterBlurMs?: number;
  /** When a transition counts as over (the notification duration), ms. */
  durationMs?: number;
  /** Mobile Safari's reports (`webkit`, the default) or Chrome's. */
  profile?: KeyboardProfile;
}

/** The guide's clock-free core: inputs carry their own times. */
export interface KeyboardModel {
  /** The inset the keyboard rests at (or is heading to), CSS px. */
  readonly inset: number;
  /** The latest transition. */
  readonly transition: KeyboardTransition;
  /** The inset presented at `time`, CSS px. */
  presentation(time: number): number;
  /** The presented inset's velocity at `time`, px/s. */
  velocity(time: number): number;
  /**
   * The visual viewport reports an inset (null when unknown) at `time` (the
   * event's timestamp). `frameBefore` is the last animation frame the page
   * rendered before the report: a busy main thread holds the report back,
   * and the keyboard then started at about that frame. Returns the
   * transition the report starts, if any.
   */
  report(
    inset: number | null,
    time: number,
    frameBefore?: number,
  ): KeyboardTransition | null;
  /**
   * A control that brings up a keyboard lost focus to nothing that brings
   * up one.
   */
  blurred(time: number): KeyboardTransition | null;
  /** A control that brings up a keyboard gained focus. */
  focused(time: number): KeyboardTransition | null;
  /**
   * Checks a predicted transition against the viewport once it should have
   * ended; moves to what the viewport says when they disagree.
   */
  verify(inset: number | null, time: number): KeyboardTransition | null;
}

const EPSILON = 0.5;

/** The inset and its velocity, seconds after a transition's start. */
interface InsetCurve {
  value(t: number): number;
  velocity(t: number): number;
}

/**
 * Creates the guide's core. Tests drive it with explicit times; the window's
 * guide feeds it events.
 */
export function createKeyboardModel(
  initialInset = 0,
  {
    showReportLagMs = keyboard.showReportLagMs,
    showReportLagMaxMs = keyboard.showReportLagMaxMs,
    hideAfterBlurMs = keyboard.hideAfterBlurMs,
    durationMs = timing.keyboardNotificationMs,
    profile = 'webkit',
  }: KeyboardModelOptions = {},
): KeyboardModel {
  const spring = toSpring(springs.keyboard);
  const chromium = profile === 'chromium';
  const ease = cubicBezier(androidKeyboard.curve);
  let transition: KeyboardTransition = {
    kind: 'change',
    from: initialInset,
    to: initialInset,
    start: -Infinity,
    velocity: 0,
    animated: false,
    predicted: false,
    curve: null,
  };
  // The inset over seconds since the transition's start.
  let curve: InsetCurve | null = null;
  // An eased slide's value and velocity (Chromium).
  const easedCurve = (
    from: number,
    to: number,
    slide: KeyboardCurve,
  ): InsetCurve => {
    const span = slide.durationMs / 1000;
    const value = (t: number) =>
      from + (to - from) * ease(Math.min(1, Math.max(0, t / span)));
    return {
      value,
      velocity: (t: number) => {
        if (t >= span) {
          return 0;
        }
        const a = Math.max(0, t - 0.001);
        const b = Math.min(span, t + 0.001);
        return (value(b) - value(a)) / (b - a);
      },
    };
  };
  const slideFor = (kind: KeyboardTransitionKind): KeyboardCurve => {
    const durationKey = kind === 'hide' ? 'hideMs' : 'showMs';
    return {
      durationMs: androidKeyboard[durationKey],
      points: androidKeyboard.curve,
      durationKey,
    };
  };
  // How long the current transition moves for.
  const lengthOf = () =>
    transition.curve != null ? transition.curve.durationMs : durationMs;
  // The inset of the last keyboard that was up, for a hide that turns back.
  let shownInset = initialInset;

  // Core Animation cuts the keyboard's spring at the notification duration.
  const presentation = (time: number): number => {
    if (time <= transition.start) {
      return transition.from;
    }
    if (curve == null || time >= transition.start + lengthOf()) {
      return transition.to;
    }
    return curve.value((time - transition.start) / 1000);
  };
  const velocity = (time: number): number => {
    if (time <= transition.start) {
      return transition.velocity;
    }
    if (curve == null || time >= transition.start + lengthOf()) {
      return 0;
    }
    return curve.velocity((time - transition.start) / 1000);
  };
  const moving = (time: number): boolean =>
    transition.animated && time < transition.start + lengthOf();

  const begin = (
    kind: KeyboardTransitionKind,
    to: number,
    start: number,
    {animated = true, predicted = false} = {},
  ): KeyboardTransition => {
    // Never date a transition before the one it interrupts.
    const at = Math.max(start, transition.start);
    const from = presentation(at);
    const v = animated ? velocity(at) : 0;
    const slide = chromium && animated ? slideFor(kind) : null;
    transition = {
      kind,
      from,
      to,
      start: at,
      velocity: v,
      animated,
      predicted,
      curve: slide,
    };
    curve =
      animated && Math.abs(to - from) + Math.abs(v) > 0
        ? slide != null
          ? easedCurve(from, to, slide)
          : solveSpring(spring, {from, to, velocity: v})
        : null;
    if (to > EPSILON) {
      shownInset = to;
    }
    return transition;
  };
  const confirm = (): null => {
    if (transition.predicted) {
      transition = {...transition, predicted: false};
    }
    return null;
  };

  return {
    get inset() {
      return transition.to;
    },
    get transition() {
      return transition;
    },
    presentation,
    velocity,
    report(inset, time, frameBefore) {
      if (inset == null) {
        return null;
      }
      const target = transition.to;
      if (Math.abs(inset - target) < EPSILON) {
        return confirm();
      }
      if (chromium) {
        // Chrome reports at the start of the slide: from now, continuing
        // from wherever a slide still under way has the inset.
        return begin(
          inset <= EPSILON ? 'hide' : target <= EPSILON ? 'show' : 'change',
          inset,
          time,
        );
      }
      if (target <= EPSILON) {
        // The keyboard came up: Safari reports it after it started to move,
        // later still when the main thread was busy (the report waited for
        // it, so the keyboard started at about the last frame before it).
        let start = time - showReportLagMs;
        if (frameBefore != null && frameBefore < start) {
          start = Math.max(frameBefore, time - showReportLagMaxMs);
        }
        return begin('show', inset, start);
      }
      if (inset <= EPSILON) {
        // A hide nobody predicted (no blur): the keyboard is already down,
        // so the content follows from now rather than jumping.
        return begin('hide', 0, time);
      }
      if (moving(time) && transition.kind === 'show') {
        // A show still under way lands somewhere else: same start, new end.
        transition = {...transition, to: inset};
        curve = solveSpring(spring, {
          from: transition.from,
          to: inset,
          velocity: transition.velocity,
        });
        shownInset = inset;
        return transition;
      }
      // Another keyboard while one is up: UIKit's zero-duration change.
      return begin('change', inset, time, {animated: false});
    },
    blurred(time) {
      // Chrome reports a hide at its start: nothing to predict.
      if (chromium || transition.to <= EPSILON) {
        return null;
      }
      return begin('hide', 0, time + hideAfterBlurMs, {predicted: true});
    },
    focused(time) {
      if (transition.kind !== 'hide' || !transition.predicted) {
        return null;
      }
      // Focus came back before the predicted hide finished: the keyboard
      // stays (or turns back) at the inset it had.
      return begin('show', shownInset, Math.max(time, transition.start), {
        predicted: true,
      });
    },
    verify(inset, time) {
      if (
        !transition.predicted ||
        inset == null ||
        time < transition.start + durationMs
      ) {
        return null;
      }
      if (Math.abs(inset - transition.to) < EPSILON) {
        return confirm();
      }
      return begin(inset > transition.to ? 'show' : 'hide', inset, time);
    },
  };
}
