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

import type {PlainDate} from '../utils';

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
