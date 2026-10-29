// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file wheelOptions.ts
 * @input Nothing; types and one pure function
 * @output WheelOption, WheelProps and nearestEnabledIndex: what both wheels
 *   share
 * @position Internal; read by Wheel.tsx (which re-exports all of it) and
 *   PickerWheel.tsx
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DateInput/Wheel.tsx
 * - /packages/core/src/DateInput/PickerWheel.tsx
 */

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
}

/**
 * The shorter signed number of rows from `from` to `to` around a loop of
 * `count` rows; a tie (exactly half a turn) goes forward.
 */
export function loopStep(from: number, to: number, count: number): number {
  const ahead = (((to - from) % count) + count) % count;
  return ahead <= count / 2 ? ahead : ahead - count;
}

/**
 * How many rows, signed, a wheel resting on row `index` travels to the
 * nearest enabled row: 0 when `index` is enabled. A tie goes toward
 * `towardIndex` (the committed row). On a looping wheel distance runs around
 * the seam, so a rest beside it turns the shorter way round and never the
 * long way across the list. A wheel with no enabled row travels to
 * `towardIndex`.
 *
 * @example
 * ```
 * // Months, looping, with only January and February enabled: a rest on
 * // December turns one row on to January, not ten back to February.
 * restingStep(monthOptions, 11, 0, true); // 1
 * ```
 */
export function restingStep(
  options: ReadonlyArray<WheelOption>,
  index: number,
  towardIndex: number,
  isLooping: boolean = false,
): number {
  const count = options.length;
  if (!isLooping || count === 0) {
    return nearestEnabledIndex(options, index, towardIndex) - index;
  }
  const isEnabled = (i: number) =>
    !options[((i % count) + count) % count].isDisabled;
  if (isEnabled(index)) {
    return 0;
  }
  const toward = loopStep(index, towardIndex, count);
  for (let distance = 1; distance <= count / 2; distance++) {
    const isBelowEnabled = isEnabled(index - distance);
    const isAboveEnabled = isEnabled(index + distance);
    if (isBelowEnabled && isAboveEnabled) {
      return toward < 0 ? -distance : distance;
    }
    if (isBelowEnabled) {
      return -distance;
    }
    if (isAboveEnabled) {
      return distance;
    }
  }
  return toward;
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
