// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file selectionHold.ts
 * @input A list row under the activation that pushed (core's row press
 *   layer: `data-astryx-pressable="cell"`, its `data-astryx-press` state and
 *   `data-astryx-deselecting`), core's animator, Bézier solver and the list
 *   table's deselect clock and curve (Core's internal motion entry), and
 *   the touch presentation's coarse-pointer query (its internal touch entry)
 * @output Exports `holdSelection`, which keeps the row that pushed selected
 *   while the pushed screen covers it and deselects it as the screen pops
 *   (`SelectionHold`)
 * @position NavigationStack's own copy of List's internal selection hold
 *   (core's List/selectionHold.ts). It mirrors that hold until Core's
 *   internal touch entry exports it (#8082); then NavigationStack takes
 *   core's hold again and this file goes.
 *
 * UIKit's reference (iOS 26.2): the row a user taps to push stays selected
 * while the pushed screen covers it. The deselect starts when the pop does
 * (the back button, or the edge swipe beginning) and runs inside the
 * navigation transition, linearly over the transition's 0.35 s, so an
 * interactive pop scrubs it with its progress. A cancelled pop selects the
 * row again at once.
 *
 * It paints as List's hold does: `data-astryx-press="held"` on the row shows
 * core's press layer (the row's `::before`) at full strength, and the touch
 * press controller never overwrites a value it did not write. The deselect
 * is the layer's opacity, `1 − progress`, driven by core's animator on the
 * `::before`, so the compositor runs it while script is busy. Under reduced
 * motion the animator's own handling applies. With a mouse there is no
 * hold (the one touch model, a coarse primary pointer).
 *
 * Progress, as the stack measures it: 0 = the pushed screen covers the row,
 * 1 = the row is revealed.
 *
 * SSR-safe: nothing runs at import time.
 *
 * SYNC: When modified, update:
 * - ./selectionHold.test.ts
 * - ./NavigationStack.tsx (its one caller)
 */

import {
  createAnimator,
  type Animator,
  type MotionCurve,
} from '@astryxdesign/core/internal/motion';
import {cubicBezier} from '@astryxdesign/core/internal/motion';
import type {SpringDescription} from '@astryxdesign/core/internal/motion';
import {list} from '@astryxdesign/core/internal/motion';
import {TOUCH_QUERY} from '@astryxdesign/core/internal/touch';

/** Core's press layer contract (utils/pressFeedback.ts), read from the DOM. */
const PRESSABLE_ATTRIBUTE = 'data-astryx-pressable';
const PRESSED_ATTRIBUTE = 'data-astryx-press';
const CELL_PRESS_PROFILE = 'cell';
/** The press state a hold writes; the press controller leaves it alone. */
const HELD_PRESS_STATE = 'held';
/**
 * On a held row once its deselect has begun, removed by a cancel: a
 * deselecting UIKit cell shows its separators again in the deselect's first
 * frame (core's list rows read it).
 */
const DESELECTING_ATTRIBUTE = 'data-astryx-deselecting';

interface StartTime {
  /**
   * Start on the document timeline (ms, `performance.now()` clock): the
   * transition's own start, so the row and the cards share one clock.
   */
  readonly startTime?: number;
}

export type SelectionHoldTiming =
  | StartTime
  | (StartTime & {
      readonly spring: SpringDescription;
      /** Progress per second at the start (a finger's release). */
      readonly velocity?: number;
    });

export interface SelectionHold {
  /** The held row. */
  readonly element: HTMLElement;
  /** Sets the deselect at `progress` (an interactive pop's frame). */
  setProgress(progress: number): void;
  /**
   * Deselects (`1`) or selects again (`0`): on `spring` from `velocity`
   * when given, else on the list table's in-transition deselect clock and
   * curve. Resolves true when it arrives, false when interrupted.
   */
  animate(to: 0 | 1, timing?: SelectionHoldTiming): Promise<boolean>;
  /** Focuses the row's own control. */
  focus(options?: FocusOptions): void;
  /**
   * Ends the hold: `true` once the row is revealed (the pop finished),
   * `false` to select it again at once (a cancelled pop; the hold stays).
   */
  end(completed: boolean): void;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** A fixed duration on a Bézier curve, as the animator plays it. */
function bezierCurve(
  from: number,
  to: number,
  durationMs: number,
  points: readonly [number, number, number, number],
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

/** The row's own control: where focus and a screen reader land. */
function focusTarget(row: HTMLElement): HTMLElement {
  const item = row.closest<HTMLElement>('[role="treeitem"]');
  if (item != null) {
    return item;
  }
  if (row.matches('a[href], button, [tabindex]:not([tabindex="-1"])')) {
    return row;
  }
  return (
    row.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) ?? row
  );
}

/** Each row's live hold, by its retire function: a second hold takes over. */
const holds = new WeakMap<HTMLElement, () => void>();

/**
 * Keeps the list row under `target` selected while a pushed screen covers
 * it. Null when `target` is not inside an enabled list row, and under a
 * mouse.
 */
export function holdSelection(
  target: EventTarget | null | undefined,
): SelectionHold | null {
  if (typeof Element === 'undefined' || !(target instanceof Element)) {
    return null;
  }
  const row = target.closest<HTMLElement>(
    `[${PRESSABLE_ATTRIBUTE}="${CELL_PRESS_PROFILE}"]`,
  );
  const view = row?.ownerDocument.defaultView;
  if (
    row == null ||
    view == null ||
    typeof view.matchMedia !== 'function' ||
    !view.matchMedia(TOUCH_QUERY).matches ||
    row.matches(':disabled, [aria-disabled="true"]') ||
    row.closest('[aria-disabled="true"]') != null
  ) {
    return null;
  }
  // A new hold takes the row from any earlier one, even mid-deselect.
  holds.get(row)?.();
  row.removeAttribute(DESELECTING_ATTRIBUTE);

  let ended = false;
  let animator: Animator | null = null;
  const layer = () => {
    animator ??= createAnimator(row, {
      pseudoElement: '::before',
      initial: {opacity: 1},
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

  const hold: SelectionHold = {
    element: row,

    setProgress(progress) {
      if (!ended) {
        row.setAttribute(DESELECTING_ATTRIBUTE, '');
        layer().set({opacity: 1 - clamp01(progress)});
      }
    },

    async animate(to, timing = {}) {
      if (ended) {
        return false;
      }
      const at = timing.startTime;
      const start = at == null ? {} : {at};
      const goal = 1 - to;
      if (to === 1) {
        row.setAttribute(DESELECTING_ATTRIBUTE, '');
      } else {
        row.removeAttribute(DESELECTING_ATTRIBUTE);
      }
      const motion = layer();
      if ('spring' in timing) {
        return motion.animate(
          {opacity: goal},
          {
            spring: timing.spring,
            // Progress per second; the highlight moves the other way.
            ...(timing.velocity == null
              ? {}
              : {velocity: {opacity: -timing.velocity}}),
          },
          start,
        ).finished;
      }
      const from = motion.get(
        'opacity',
        at ??
          (typeof performance === 'undefined' ? Date.now() : performance.now()),
      );
      // The whole way takes the deselect's clock; a partial way its share.
      const durationMs = list.deselect.navigationPopMs * Math.abs(goal - from);
      return motion.play(
        {
          opacity: bezierCurve(
            from,
            goal,
            durationMs,
            list.deselect.navigationPopCurve,
          ),
        },
        start,
      ).finished;
    },

    focus(options) {
      if (row.isConnected) {
        // The stack passes the focus options of the input that started the
        // pop (no ring after a finger's, as UIKit draws none).
        focusTarget(row).focus(options);
      }
    },

    end(completed) {
      if (ended) {
        return;
      }
      drop();
      row.removeAttribute(DESELECTING_ATTRIBUTE);
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
