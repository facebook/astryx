// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file selectionHold.ts
 * @input A list row under an activation target, the press layer's held state
 *   (pressLayer.stylex.ts), the motion foundation's animator and Bézier
 *   solver (motion/), and the in-transition deselect clock
 *   (motion/uikit/list.ts)
 * @output Exports `holdSelection`, which keeps a tapped list row selected
 *   while a navigation covers it and deselects it as the navigation pops
 *   (`SelectionHold`), plus its timing types and the row press profile
 * @position Interaction utility. A navigation container (a stack) calls it
 *   with the target of the activation that pushed; Item and TreeList rows are
 *   the rows it finds.
 *
 * UIKit's reference (iOS 26.2): the row a user taps to push stays selected
 * while the pushed screen covers it. The deselect starts when the pop does
 * (the back button, or the edge swipe beginning) and runs inside the
 * navigation transition, linearly over the transition's 0.35 s, so an
 * interactive pop scrubs it with its progress. A cancelled pop re-selects the
 * row at once. VoiceOver focus returns to the row.
 *
 * HOW IT PAINTS. The hold writes `data-astryx-press="held"` on the row, which
 * shows the press layer (the row's `::before`) at full strength; the touch
 * press controller never overwrites a value it did not write. The deselect is
 * the layer's opacity, `1 − progress`, driven by the motion foundation's
 * animator on the `::before` (Web Animations: the compositor runs it while
 * script is busy, on the caller's clock). Its curves are evaluated in closed
 * form, never read back from the DOM: `presentation` answers where the
 * highlight is at a time from the curve itself, so a finger landing
 * mid-animation starts from the value on screen.
 *
 * Progress, as the navigation measures it: 0 = the pushed screen covers the
 * row, 1 = the row is revealed. Highlight = 1 − progress.
 *
 * SSR-safe: nothing runs at import time.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/utils/selectionHold.test.ts
 * - /packages/core/src/List/__tests__/ListSelectionHold.interaction.browser.spec.ts
 * - /packages/core/src/utils/pressLayer.stylex.ts (the held arm)
 */

import {
  createAnimator,
  type Animator,
  type MotionCurve,
} from '../motion/animator';
import {cubicBezier, type BezierPoints} from '../motion/bezier';
import type {SpringDescription} from '../motion/spring';
import {list} from '../motion/uikit/list';
import {PRESSABLE_ATTRIBUTE, PRESSED_ATTRIBUTE} from './pressFeedback';

/**
 * The press profile a list row carries in its `data-astryx-pressable`
 * marker: rows paint the press on the cell layer and release on the cell's
 * clock.
 */
export const CELL_PRESS_PROFILE = 'cell';

/**
 * Spread on a list row's pressable element after the press feedback hook's
 * props: the marker carries the cell profile.
 */
export const cellPressableProps: {
  readonly [PRESSABLE_ATTRIBUTE]: typeof CELL_PRESS_PROFILE;
} = {[PRESSABLE_ATTRIBUTE]: CELL_PRESS_PROFILE};

/** The press state a hold writes; owned by the hold, never by the controller. */
export const HELD_PRESS_STATE = 'held';

interface StartTime {
  /**
   * Start on the document timeline (ms, `performance.now()` clock); now by
   * default. Pass the transition's own start to ride its clock.
   */
  readonly startTime?: number;
}

/** UIKit's in-transition deselect: `list.deselect`, 350 ms linear. */
export type HoldTransitionTiming = StartTime;

/** A spring, as the navigation's own (`velocity` in progress per second). */
export interface HoldSpringTiming extends StartTime {
  readonly spring: SpringDescription;
  readonly velocity?: number;
}

/** A fixed duration on a Bézier curve (Reduce Motion's cross-fade). */
export interface HoldCurveTiming extends StartTime {
  readonly durationMs: number;
  readonly curve: BezierPoints;
}

export type HoldTiming =
  HoldTransitionTiming | HoldSpringTiming | HoldCurveTiming;

export interface SelectionHold {
  /** The row kept selected. */
  readonly element: HTMLElement;
  /**
   * Puts the deselect at `progress` (0 covered … 1 revealed) now: the
   * per-frame write of an interactive pop. Stops a running `animate`, whose
   * promise resolves false.
   */
  setProgress(progress: number): void;
  /**
   * Moves the deselect to `to` from its presentation value: 1 when the pop
   * completes, 0 when it cancels. With no spring or duration, UIKit's
   * in-transition deselect (350 ms linear). Resolves true when it arrives,
   * false when `setProgress`, another `animate` or `end` interrupts it.
   */
  animate(to: 0 | 1, timing?: HoldTiming): Promise<boolean>;
  /** The deselect's progress at `time` (default now), from its curve. */
  presentation(time?: number): number;
  /** Focuses the row's own control (the element a screen reader lands on). */
  focus(options?: FocusOptions): void;
  /**
   * Ends the hold. `true`: the row was revealed for good (a completed pop,
   * or the held screen left the stack another way); the row is deselected at
   * once, with no animation of its own. `false`: the pop was cancelled; the
   * row is selected again at once, and the hold stays for the next pop.
   */
  end(completed: boolean): void;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function defaultNow(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

/**
 * A fixed duration on a Bézier curve, from `from` to `to`, as the
 * animator plays it (seconds; velocity in units per second).
 */
function bezierCurve(
  from: number,
  to: number,
  durationMs: number,
  points: BezierPoints,
): MotionCurve {
  const ease = cubicBezier(points);
  const duration = Math.max(0, durationMs) / 1000;
  const delta = to - from;
  const progress = (t: number) => (duration <= 0 ? 1 : clamp01(t / duration));
  return {
    duration,
    at: t => from + delta * ease(progress(t)),
    velocity: t => {
      if (duration <= 0) {
        return 0;
      }
      const x = progress(t);
      const x0 = Math.max(0, x - 1e-4);
      const x1 = Math.min(1, x + 1e-4);
      return (delta * (ease(x1) - ease(x0))) / ((x1 - x0) * duration);
    },
  };
}

/** The row's own control: the element focus and a screen reader land on. */
function focusTarget(row: HTMLElement): HTMLElement {
  if (row.matches('a[href], button, [tabindex]:not([tabindex="-1"])')) {
    return row;
  }
  return (
    row.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) ?? row
  );
}

/**
 * The live hold of each row, by its retire function: a second hold on a row
 * takes over from the first, which goes inert without touching the row.
 */
const holds = new WeakMap<HTMLElement, () => void>();

/**
 * Keeps the list row under `target` selected while a navigation covers it,
 * and returns the handle that deselects it as the navigation pops. Null when
 * `target` is not inside an enabled list row (an Item or TreeList row with an
 * action).
 *
 * @example
 * ```
 * // In the same task as the activation that pushes:
 * const hold = holdSelection(event.target);
 * // A programmatic pop, on the transition's own clock:
 * await hold?.animate(1, {startTime});
 * hold?.end(true);
 * hold?.focus({preventScroll: true});
 * ```
 */
export function holdSelection(
  target: EventTarget | null | undefined,
  options: {readonly now?: () => number} = {},
): SelectionHold | null {
  if (typeof Element === 'undefined' || !(target instanceof Element)) {
    return null;
  }
  const row = target.closest<HTMLElement>(
    `[${PRESSABLE_ATTRIBUTE}="${CELL_PRESS_PROFILE}"]`,
  );
  if (
    row == null ||
    row.matches(':disabled, [aria-disabled="true"]') ||
    row.closest('[aria-disabled="true"]') != null
  ) {
    return null;
  }
  holds.get(row)?.();

  const now = options.now ?? defaultNow;
  let ended = false;
  /**
   * The layer's opacity (the highlight), once something moves it; until
   * then, and after a cancel, the held state shows it at 1.
   */
  let animator: Animator | null = null;
  const layer = () => {
    animator ??= createAnimator(row, {
      pseudoElement: '::before',
      initial: {opacity: 1},
      now,
    });
    return animator;
  };
  const drop = () => {
    animator?.dispose();
    animator = null;
  };
  const retire = () => {
    drop();
    ended = true;
  };

  const presentation = (time = now()): number =>
    animator == null ? 0 : clamp01(1 - animator.get('opacity', time));

  const hold: SelectionHold = {
    element: row,

    setProgress(progress) {
      if (!ended) {
        layer().set({opacity: 1 - clamp01(progress)});
      }
    },

    async animate(to, timing = {}) {
      if (ended) {
        return false;
      }
      const at = timing.startTime ?? now();
      const target = 1 - to;
      const motion = layer();
      if ('spring' in timing) {
        return motion.animate(
          {opacity: target},
          {
            spring: timing.spring,
            // Progress per second; the highlight moves the other way.
            ...(timing.velocity == null
              ? {}
              : {velocity: {opacity: -timing.velocity}}),
          },
          {at, reducedMotion: 'keep'},
        ).finished;
      }
      const from = motion.get('opacity', at);
      const durationMs =
        'durationMs' in timing
          ? timing.durationMs
          : // The in-transition deselect covers the whole way in its clock;
            // a partial way (a pop started from a scrubbed value) takes its
            // share.
            list.deselect.navigationPopMs * Math.abs(target - from);
      const points =
        'curve' in timing ? timing.curve : list.deselect.navigationPopCurve;
      return motion.play(
        {opacity: bezierCurve(from, target, durationMs, points)},
        {at, reducedMotion: 'keep'},
      ).finished;
    },

    presentation,

    focus(focusOptions) {
      if (row.isConnected) {
        focusTarget(row).focus(focusOptions);
      }
    },

    end(completed) {
      if (ended) {
        return;
      }
      drop();
      if (completed) {
        ended = true;
        if (holds.get(row) === retire) {
          holds.delete(row);
        }
        if (row.getAttribute(PRESSED_ATTRIBUTE) === HELD_PRESS_STATE) {
          row.removeAttribute(PRESSED_ATTRIBUTE);
        }
      } else {
        // Selected again at once; the hold stays for the next pop.
        row.setAttribute(PRESSED_ATTRIBUTE, HELD_PRESS_STATE);
      }
    },
  };

  row.setAttribute(PRESSED_ATTRIBUTE, HELD_PRESS_STATE);
  holds.set(row, retire);
  return hold;
}
