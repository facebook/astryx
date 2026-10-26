// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file wheelOptions.ts
 * @input Nothing; types and one pure function
 * @output WheelOption, WheelProps, WheelHandle, WheelSpinOptions and
 *   nearestEnabledIndex: what both wheels share
 * @position Internal; read by Wheel.tsx (which re-exports all of it) and
 *   PickerWheel.tsx
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DateInput/Wheel.tsx
 * - /packages/core/src/DateInput/PickerWheel.tsx
 */

import type {Ref} from 'react';
import type {BezierPoints} from '../motion/bezier';

export interface WheelOption {
  /** Stable numeric identity of the row (a month 1-12, or a year). */
  value: number;
  /** Row text. */
  label: string;
  /**
   * Rows outside min/max stay visible but cannot be committed: a wheel that
   * stops on one travels on to the nearest enabled row.
   */
  isDisabled?: boolean;
}

/** Options for a programmatic turn. */
export interface WheelSpinOptions {
  /** Seconds. @default the theme's `picker.tapSpin.durationMs` (0.3 s) */
  duration?: number;
  /**
   * Cubic-bézier control points.
   * @default the theme's `timing.curves.move`
   */
  curve?: BezierPoints;
}

/** What a Wheel's `ref` exposes. */
export interface WheelHandle {
  /**
   * Turn the wheel onto `index` (an index into `options`), then commit it as
   * a rest would. Resolves true on arrival, false if a finger or another
   * turn interrupted it. Under a fine pointer the row commits at once and
   * the column scrolls to it as it does for any new value.
   */
  spinTo(index: number, options?: WheelSpinOptions): Promise<boolean>;
}

export interface WheelProps {
  /** Accessible name for the column, e.g. "Month". */
  label: string;
  /** Rows, top to bottom. */
  options: ReadonlyArray<WheelOption>;
  /** Committed value; must match one option's `value`. */
  value: number;
  /** Fired when the wheel comes to rest on a different, enabled row. */
  onChange: (value: number) => void;
  /**
   * False while the wheel is hidden: the scrolling column waits to listen
   * and scroll (a hidden scroller's offsets mean nothing), and the touch wheel
   * turns its gestures off and shows a value set from outside without motion.
   */
  isActive?: boolean;
  /**
   * The rows repeat without end, as UIDatePicker's minutes and hours do: the
   * last row is followed by the first. A list shorter than the column (a
   * minute column every 15 minutes) repeats down all of it, as UIKit's does.
   * Under a finger only; a single row never loops.
   */
  isLooping?: boolean;
  /**
   * The row the wheel rests on after stopping on `index`. When it differs,
   * the wheel turns on to it and commits that one. Under a finger only.
   * @default the nearest enabled row (`nearestEnabledIndex`)
   */
  resolveRest?: (index: number) => number;
  /** Programmatic turns: `spinTo(index)`. */
  ref?: Ref<WheelHandle>;
}

/**
 * The enabled row nearest `index`: `index` itself when it is enabled,
 * otherwise the closest enabled row on either side. A tie goes to the side of
 * `towardIndex` (the committed row), and a wheel with no enabled row stays on
 * `towardIndex`.
 *
 * @example
 * ```
 * // Hours 0-23 with 09:00-17:00 bounds: stopping on 7 rests on 9.
 * nearestEnabledIndex(hourOptions, 7, 10); // 9
 * ```
 */
export function nearestEnabledIndex(
  options: ReadonlyArray<WheelOption>,
  index: number,
  towardIndex: number,
): number {
  const isEnabled = (i: number) =>
    i >= 0 && i < options.length && !options[i].isDisabled;
  if (isEnabled(index)) {
    return index;
  }
  for (let distance = 1; distance < options.length; distance++) {
    const below = index - distance;
    const above = index + distance;
    const isBelowEnabled = isEnabled(below);
    const isAboveEnabled = isEnabled(above);
    if (isBelowEnabled && isAboveEnabled) {
      return towardIndex < index ? below : above;
    }
    if (isBelowEnabled) {
      return below;
    }
    if (isAboveEnabled) {
      return above;
    }
  }
  return towardIndex;
}
