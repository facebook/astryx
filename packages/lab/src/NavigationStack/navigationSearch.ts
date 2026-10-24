// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file navigationSearch.ts
 * @input The UIKit search table (`uikit.search`: the activation's duration
 *   and curve, and the bar's fade fractions) and the cubic-Bézier solver,
 *   from `@astryxdesign/core/motion/experimental`
 * @output The bar side of a search activation, as pure functions of its
 *   progress: the back button's and inline title's opacity, the large
 *   title's, the large title's return on cancel; `searchClock`, the
 *   activation's length and easing under an element's theme; and
 *   `searchCurve`, which turns any of them into a MotionCurve on that clock
 * @position Math for NavigationStack's search hook (NavigationStack.tsx);
 *   the field's own motion is SearchField's
 *
 * Measured on iOS 26.2 (uikit/search.ts, F4 batch 50): the activation runs
 * 383 ms on cubic-bezier(0.42, 0, 0.58, 1). With p its progress, the back
 * button's opacity is 1 − p / 0.35 (it does not move), the large title's
 * (1 − p / 0.35)², and a visible inline title fades by the back button's
 * rule. On cancel the back button is back at once, and the large title
 * fades in over the last 35 %: (q − 0.65) / 0.35.
 *
 * SYNC: When modified, update navigationSearch.test.ts.
 */

import {
  cubicBezier,
  resolveMotion,
  uikit,
  type BezierPoints,
  type MotionCurve,
} from '@astryxdesign/core/motion/experimental';

const {search} = uikit;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** The activation's clock: its length, s, and its easing. */
export interface SearchClock {
  durationS: number;
  ease: (t: number) => number;
}

/**
 * The activation's clock under `element`'s theme, read when a move starts:
 * the motion roles `search.activationMs` and `search.activationCurve`
 * (UIKit's UIViewPropertyAnimator curve by default). SearchField reads the
 * same roles, so a theme's retune moves the field and the bar together.
 */
export function searchClock(element: Element | null | undefined): SearchClock {
  return {
    durationS: resolveMotion(element, search, 'activationMs') / 1000,
    ease: cubicBezier(
      resolveMotion(element, search.activationCurve) as BezierPoints,
    ),
  };
}

/** The back button's (and a visible inline title's) opacity at progress p. */
export function searchBarItemOpacity(p: number): number {
  return clamp01(1 - p / search.bar.fadeOutProgress);
}

/** The large title's opacity at activation progress p. */
export function searchLargeTitleOpacity(p: number): number {
  return searchBarItemOpacity(p) ** 2;
}

/** The large title's opacity at cancel progress q: it returns at the end. */
export function searchLargeTitleReturnOpacity(q: number): number {
  const from = search.bar.largeTitleFadeInProgress;
  return clamp01((q - from) / (1 - from));
}

/**
 * A curve over `durationS` on the activation's easing: `value(r)` of the
 * eased progress r (0 → 1). Velocity is the curve's own derivative, so a
 * motion interrupted mid-way continues from where it is.
 */
export function searchCurve(
  ease: SearchClock['ease'],
  durationS: number,
  value: (r: number) => number,
): MotionCurve {
  const at = (t: number) =>
    value(durationS <= 0 ? 1 : ease(clamp01(t / durationS)));
  const step = Math.max(1e-4, durationS * 1e-4);
  return {
    duration: Math.max(0, durationS),
    at,
    velocity: t => {
      if (durationS <= 0) {
        return 0;
      }
      const lo = Math.max(0, t - step);
      const hi = Math.min(durationS, t + step);
      return hi > lo ? (at(hi) - at(lo)) / (hi - lo) : 0;
    },
  };
}
