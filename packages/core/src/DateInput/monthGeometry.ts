// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file monthGeometry.ts
 * @input PlainDate values and month indexes
 * @output Pure month-index arithmetic and the mounted pane window
 * @position Internal helper; consumed by MonthScroller.tsx and DateInput.tsx
 *
 * A "month index" is a single integer that totally orders calendar months:
 * `year * 12 + (month - 1)`. The calendar's pager is a list of equal-width
 * pages, so one integer converts freely between a month and a page.
 *
 * SYNC: When modified, update DateInputTouch.test.tsx.
 */

import {
  getDaysInMonth,
  plainDateIsAfter,
  plainDateIsBefore,
  type PlainDate,
} from '../utils';

/** How many months are reachable in either direction when unbounded. */
export const DEFAULT_MONTH_REACH = 600;

/** `year * 12 + (month - 1)`, for a 1-based month. */
export function toMonthIndex(year: number, month: number): number {
  return year * 12 + (month - 1);
}

/** The month index of a PlainDate. */
export function monthIndexOf(date: PlainDate): number {
  return toMonthIndex(date.year, date.month);
}

/** Inverse of {@link toMonthIndex}; month comes back 1-based. */
export function fromMonthIndex(index: number): {year: number; month: number} {
  return {
    year: Math.floor(index / 12),
    month: (((index % 12) + 12) % 12) + 1,
  };
}

/** `value` limited to `[min, max]`. */
export function clampIndex(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * `date` moved to the month at `monthIndex`, keeping its day, as
 * UIDatePicker's month and year wheels move the date
 * (motion/uikit/datePicker.ts `calendar.monthYearWheels.changesDate`): a day
 * the month lacks becomes the month's last day (`wheels.dayClampsToMonth`),
 * and the result is held inside the bounds.
 *
 * @example
 * ```
 * dateInMonth({year: 2026, month: 1, day: 31}, toMonthIndex(2026, 2));
 * // {year: 2026, month: 2, day: 28}
 * ```
 */
export function dateInMonth(
  date: PlainDate,
  monthIndex: number,
  min?: PlainDate | null,
  max?: PlainDate | null,
): PlainDate {
  const {year, month} = fromMonthIndex(monthIndex);
  const moved = {
    year,
    month,
    day: Math.min(date.day, getDaysInMonth(year, month)),
  };
  if (min != null && plainDateIsBefore(moved, min)) {
    return min;
  }
  if (max != null && plainDateIsAfter(moved, max)) {
    return max;
  }
  return moved;
}

export interface PaneWindow {
  /** First rendered row, inclusive. */
  start: number;
  /** Last rendered row, inclusive. */
  end: number;
}

/**
 * The slice of rows to actually mount around `centerRow`.
 *
 * Only a handful of panes exist in the DOM at a time. `overscan` is how many
 * extra panes ride along on each side of the pager's target month.
 */
export function paneWindow(
  centerRow: number,
  rowCount: number,
  overscan: number,
): PaneWindow {
  return {
    start: Math.max(0, centerRow - overscan),
    end: Math.min(rowCount - 1, centerRow + overscan),
  };
}

/** `[start, end]` inclusive, as an array of rows. */
export function rowsIn({start, end}: PaneWindow): number[] {
  const rows: number[] = [];
  for (let row = start; row <= end; row++) {
    rows.push(row);
  }
  return rows;
}
