// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file keyboardModel.ts
 * @input `keyboard` (its spring and report timings) and
 *   `timing.keyboardNotificationMs` from the UIKit table
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
 *   busy: the report waits for it, while the keyboard rises on its own
 *   schedule, `keyboard.focusToShowMs` after the focus. A report that
 *   follows a gap in the page's frames is dated from the focus that brought
 *   the keyboard up (no earlier than the last frame before the report),
 *   however late it is, so content following the keyboard joins its spring
 *   where the keyboard is by then. Without a focus to date from, it goes
 *   back to the last frame before the report, at most
 *   `keyboard.showReportLagMaxMs`.
 * - Hide: the `resize` arrives once the keyboard is down. The keyboard starts
 *   to fall `keyboard.hideAfterBlurMs` after the focused control loses focus
 *   to nothing that brings up a keyboard, so the model starts the hide from
 *   the blur (a prediction) and takes the late `resize` as its confirmation.
 *   A prediction the viewport has not confirmed once it should have ended
 *   gives way to what the viewport says (`verify`).
 * - A change while the keyboard is up (a field that brings up the number
 *   pad) jumps: UIKit posts it with a zero duration.
 *
 * Chrome (the `chromium` profile) reports each keyboard slide through the
 * visual viewport just after it starts (README.md, "What the page sees", for
 * Chrome), and content rides Gboard's own slides (motion/android/keyboard.ts,
 * fitted on Chromium 158 with Gboard):
 *
 * - Show: from the report, dated back `androidKeyboard.showReportLagMs` (the
 *   report's first painted frame trails Gboard's first moved frame by 14 to
 *   35 ms), on `showCurve` over `showMs`, joining the slide where it is. An
 *   `<input>` that brings an accessory bar first (a smaller report, the
 *   keyboard's following) rides to the last keyboard's height instead
 *   (predicted), and the keyboard's report confirms it.
 * - Hide: on `hideCurve` over `hideMs`, from `androidKeyboard.hideAfterBlurMs`
 *   after a blur that brings no keyboard (predicted, as Gboard starts down at
 *   the blur), or from Chrome's report dated back `hideReportLagMs` when
 *   nothing predicted it (Back).
 * - A keyboard that changes while up (another keyboard) lays out at once.
 *
 * SYNC: When modified, update /packages/core/src/keyboard/README.md
 */

import {keyboard} from '../motion/uikit/keyboard';
import {keyboard as androidKeyboard} from '../motion/android/keyboard';
import {cubicBezier} from '../motion/bezier';
import {timing} from '../motion/uikit/timing';
import {
  solveSpring,
  toSpring,
  type SpringCurve,
  type SpringDescription,
} from '../motion/spring';

/** Which browser's keyboard reports the model reads. */
export type KeyboardProfile = 'webkit' | 'chromium';

/**
 * An eased slide: the curve a transition plays instead of UIKit's keyboard
 * spring (Android's keyboard going down).
 */
export interface KeyboardCurve {
  /** Length, ms. */
  readonly durationMs: number;
  /** Cubic-bézier control points. */
  readonly points: readonly [number, number, number, number];
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
   * The eased slide the keyboard moves on where it slides on one (Gboard in
   * Chrome on Android), or null where it moves on `spring`.
   */
  readonly curve: KeyboardCurve | null;
  /**
   * The spring the keyboard moves on where `curve` is null (UIKit's keyboard
   * spring: the system's own, never a theme's). A surface riding the keyboard
   * plays `curve` when it is set and this spring otherwise, from `start`
   * (architecture:react-component-runtime INV11; rideKeyboard does).
   */
  readonly spring: SpringDescription;
}

/** Timing of the keyboard as the page sees it; the UIKit table's by default. */
export interface KeyboardModelOptions {
  /** How long after the keyboard starts to rise the viewport reports it, ms. */
  showReportLagMs?: number;
  /** The furthest a show is dated back to the frame before its report, ms. */
  showReportLagMaxMs?: number;
  /** How long after a focus the keyboard starts to rise, ms. */
  focusToShowMs?: number;
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
    focusToShowMs = keyboard.focusToShowMs,
    hideAfterBlurMs = keyboard.hideAfterBlurMs,
    durationMs = timing.keyboardNotificationMs,
    profile = 'webkit',
  }: KeyboardModelOptions = {},
): KeyboardModel {
  const spring = toSpring(keyboard.spring);
  const chromium = profile === 'chromium';
  let transition: KeyboardTransition = {
    kind: 'change',
    from: initialInset,
    to: initialInset,
    start: -Infinity,
    velocity: 0,
    animated: false,
    predicted: false,
    curve: null,
    spring: keyboard.spring,
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
    const ease = cubicBezier(slide.points);
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
  // Gboard's slides, as Chrome draws them: the table's show and hide curves.
  const showSlide: KeyboardCurve = {
    durationMs: androidKeyboard.showMs,
    points: androidKeyboard.showCurve,
  };
  const hideSlide: KeyboardCurve = {
    durationMs: androidKeyboard.hideMs,
    points: androidKeyboard.hideCurve,
  };
  // How long the current transition moves for.
  const lengthOf = () =>
    transition.curve != null ? transition.curve.durationMs : durationMs;
  // The inset of the last keyboard that was up, for a hide that turns back.
  let shownInset = initialInset;
  // When a control that brings up a keyboard last gained focus.
  let focusAt: number | null = null;

  // Core Animation cuts the keyboard's spring at the notification duration.
  const presentation = (time: number): number => {
    // A jump has happened at its start; a curve starts from `from`.
    if (time < transition.start) {
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
    const slide =
      chromium && animated ? (to > from ? showSlide : hideSlide) : null;
    transition = {
      kind,
      from,
      to,
      start: at,
      velocity: v,
      animated,
      predicted,
      curve: slide,
      spring: keyboard.spring,
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
        if (inset <= EPSILON) {
          // A hide nothing predicted (Back): Chrome reports it just after
          // Gboard starts down, so it rides from that moment.
          return begin('hide', 0, time - androidKeyboard.hideReportLagMs);
        }
        if (target <= EPSILON) {
          // Chrome reports the show just after Gboard starts up: ride from
          // that moment, joining the slide where it is. A smaller first
          // report is the accessory bar, the keyboard's own following: ride
          // to the last keyboard's height and let its report confirm it.
          const predicted = shownInset > inset + EPSILON;
          return begin(
            'show',
            predicted ? shownInset : inset,
            time - androidKeyboard.showReportLagMs,
            {predicted},
          );
        }
        // The keyboard changed while up (another keyboard, or the keyboard's
        // report after the accessory bar's): Chrome lays the page out at
        // once.
        return begin('change', inset, time, {animated: false});
      }
      if (target <= EPSILON) {
        // The keyboard came up: Safari reports it after it started to move,
        // later still when the main thread was busy (the report waited for
        // it, so the keyboard started at about the last frame before it).
        let start = time - showReportLagMs;
        if (frameBefore != null && frameBefore < start) {
          // A busy main thread held the report back. The keyboard rose on
          // UIKit's schedule after the focus that brought it up; without
          // one, it started at about the last frame before the report.
          start =
            focusAt != null && focusAt < time
              ? Math.min(start, Math.max(frameBefore, focusAt + focusToShowMs))
              : Math.max(frameBefore, time - showReportLagMaxMs);
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
      if (transition.to <= EPSILON) {
        return null;
      }
      return begin(
        'hide',
        0,
        time + (chromium ? androidKeyboard.hideAfterBlurMs : hideAfterBlurMs),
        {predicted: true},
      );
    },
    focused(time) {
      focusAt = time;
      if (transition.kind !== 'hide' || !transition.predicted) {
        return null;
      }
      // Focus came back before the predicted hide finished: the keyboard
      // turns back to the inset it had.
      return begin('show', shownInset, Math.max(time, transition.start), {
        predicted: true,
      });
    },
    verify(inset, time) {
      if (
        !transition.predicted ||
        inset == null ||
        time < transition.start + lengthOf()
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
