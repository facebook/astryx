// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file paging.ts
 * @input A pager's geometry (page stride, count), a release (position,
 *   velocity, the page the drag started on) and the UIKit paging constants
 * @output Exports `pagingReleaseVelocity` (the page and settle velocities),
 *   `selectPage` (the page a release settles on),
 *   `solvePaging` (UIKit's paging settle as a MotionCurve the animator plays)
 *   and `solveAnimatedPageScroll` (`setContentOffset(_:animated:)`)
 * @position Pure math; no DOM, no React. Read by hooks/usePager.ts
 *
 * Coordinates: `position` is the content offset along the paging axis in px,
 * 0 at page 0 and growing toward later pages (a pager's track is translated
 * by −position, mirrored in RTL by its owner). Velocities are px/s of that
 * offset, positive toward later pages.
 *
 * The settle is UIKit's own integrator (uikit/paging.ts), run step by step:
 * no closed form reproduces its per-frame stepping, and a release needs at
 * most ~400 steps (well under a millisecond of work), so `solvePaging`
 * integrates once into a table and the curve reads it.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/motion/paging.test.ts
 * - /packages/core/src/motion/README.md
 */

import type {MotionCurve} from './animator';
import {paging} from './uikit/paging';

/**
 * The two velocities a paging release reads, UIKit's way, from the pan's
 * last two velocity samples (UIPanGestureRecognizer's own filter, which the
 * scroll view shares):
 *
 * - `page`: the last sample, for the page choice. It never decays, so a drag
 *   held still before the lift still pages with the speed it had.
 * - `settle`: `settleVelocityWeight` × the last sample + the rest × the one
 *   before, zeroed below `velocityFloor`, and zero after a hold of
 *   `stillnessMs` or more: the velocity the settle starts at.
 */
export function pagingReleaseVelocity({
  current,
  previous,
  stillFor,
}: {
  /** The last velocity sample (px/s): the pan's `velocity()` at the lift. */
  current: number;
  /** The sample before it (px/s); `current` when there was only one. */
  previous: number;
  /** How long the finger was still before the lift, ms. */
  stillFor: number;
}): {page: number; settle: number} {
  const {settleVelocityWeight, velocityFloor, stillnessMs} = paging.release;
  const blended =
    settleVelocityWeight * current + (1 - settleVelocityWeight) * previous;
  const settle =
    stillFor >= stillnessMs || Math.abs(blended) < velocityFloor ? 0 : blended;
  return {page: current, settle};
}

export interface PageRelease {
  /** Content offset at the lift, px (may be past either end). */
  position: number;
  /**
   * Content velocity for the page choice, px/s
   * (`pagingReleaseVelocity(…).page`).
   */
  velocity: number;
  /** Distance between consecutive pages: page width plus the gap, px. */
  stride: number;
  /** Number of pages (≥ 1). */
  count: number;
  /** The page the drag started on (its rest position when the finger landed). */
  startIndex: number;
  /** Wraps around: the target may leave [0, count − 1] (the owner wraps it). */
  loop?: boolean;
}

/**
 * The page a release settles on, UIKit's rule: faster than
 * `paging.release.advanceSpeed`, the next page in the direction of the
 * velocity from wherever the content is; slower, the page nearest the
 * content (past `commitFraction` of a page, the next one). Never more than
 * `maxPagesFromStart` from the page the drag started on; clamped to the
 * pages unless looping.
 *
 * @example
 * ```
 * // Released at rest 60 % of the way from page 1 to page 2: page 2.
 * selectPage({position: 1.6 * 402, velocity: 0, stride: 402, count: 6, startIndex: 1});
 * // Flicked forward at 600 px/s from 6 % past page 1: page 2.
 * selectPage({position: 1.06 * 402, velocity: 600, stride: 402, count: 6, startIndex: 1});
 * ```
 */
export function selectPage({
  position,
  velocity,
  stride,
  count,
  startIndex,
  loop = false,
}: PageRelease): number {
  if (!(stride > 0) || count < 1) {
    return 0;
  }
  const page = position / stride;
  // A hair of tolerance so a release exactly on a page boundary reads as on it.
  const epsilon = 1e-6;
  let target: number;
  if (velocity >= paging.release.advanceSpeed) {
    target = Math.floor(page + epsilon) + 1;
  } else if (velocity <= -paging.release.advanceSpeed) {
    target = Math.ceil(page - epsilon) - 1;
  } else {
    const base = Math.floor(page);
    target = page - base >= paging.release.commitFraction ? base + 1 : base;
  }
  const reach = paging.release.maxPagesFromStart;
  target = Math.max(startIndex - reach, Math.min(startIndex + reach, target));
  if (!loop) {
    target = Math.max(0, Math.min(count - 1, target));
  }
  return target;
}

/** A paging settle: the curve and where it ends. */
export interface PagingCurve extends MotionCurve {
  readonly from: number;
  readonly to: number;
  /** Integration steps the settle took. */
  readonly steps: number;
}

/**
 * UIKit's paging settle from `from` (px) moving at `velocity` (px/s) onto
 * `to`: `paging.integrator` stepped `stepsPerSecond` times a second, ending
 * exactly on `to`. The same motion returns an overscrolled pager to its
 * first or last page.
 *
 * The release velocity enters as UIKit hands it to the integrator, in px per
 * millisecond per step; at 960 steps a second the content therefore starts at
 * 96 % of the finger's speed, as it does in UIKit.
 */
export function solvePaging({
  from,
  velocity,
  to,
}: {
  from: number;
  velocity: number;
  to: number;
}): PagingCurve {
  const {springPull, friction, stepsPerSecond, restDistance, restSpeed} =
    paging.integrator;
  const xs: number[] = [from];
  const vs: number[] = [velocity / 1000];
  let x = from;
  let v = velocity / 1000;
  // ~10 s of steps: far beyond any settle (≈ 0.35 s from rest).
  const maxSteps = stepsPerSecond * 10;
  let steps = 0;
  while (steps < maxSteps) {
    if (Math.abs(to - x) < restDistance && Math.abs(v) < restSpeed) {
      break;
    }
    v = (v + (to - x) * springPull) * friction;
    x += v;
    steps += 1;
    xs.push(x);
    vs.push(v);
  }
  xs[xs.length - 1] = to;
  vs[vs.length - 1] = 0;
  const duration = steps / stepsPerSecond;
  const last = xs.length - 1;
  const read = (table: number[], t: number): number => {
    if (!(t > 0)) {
      return table[0];
    }
    const s = t * stepsPerSecond;
    if (s >= last) {
      return table[last];
    }
    const i = Math.floor(s);
    const f = s - i;
    return table[i] + (table[i + 1] - table[i]) * f;
  };
  return {
    from,
    to,
    steps,
    duration,
    at: t => read(xs, t),
    // px per step × steps per second
    velocity: t => read(vs, t) * stepsPerSecond,
  };
}

/**
 * `setContentOffset(_:animated:)`: `paging.animatedScroll.duration` on a
 * sinusoidal ease-in-out, whatever the distance. UIKit starts it from the
 * current offset and drops any velocity, as here.
 */
export function solveAnimatedPageScroll({
  from,
  to,
}: {
  from: number;
  to: number;
}): MotionCurve {
  const {duration} = paging.animatedScroll;
  const distance = to - from;
  return {
    duration,
    at: t => {
      const u = Math.min(1, Math.max(0, t / duration));
      return from + (distance * (1 - Math.cos(Math.PI * u))) / 2;
    },
    velocity: t => {
      if (t <= 0 || t >= duration) {
        return 0;
      }
      return (
        ((distance * Math.PI) / (2 * duration)) *
        Math.sin((Math.PI * t) / duration)
      );
    },
  };
}
