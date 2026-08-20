// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file monthGeometry.ts
 * @input PlainDate values, scroll offsets, pane heights
 * @output Pure month-index arithmetic and the virtualized pane window
 * @position Internal helper; consumed by MonthScroller.tsx and DateInputMobile.tsx
 *
 * A "month index" is a single integer that totally orders calendar months:
 * `year * 12 + (month - 1)`. The scroller is a list of equal-height panes, so
 * one integer converts freely between a month, a row in that list, and a
 * scroll offset — which is the whole trick behind continuous scrolling.
 *
 * These are pure functions on purpose: the scroll math is the part most likely
 * to be wrong, and it is testable without a layout engine.
 *
 * SYNC: When modified, update DateInputMobile.test.tsx.
 */

import type {PlainDate} from '@astryxdesign/core/utils';

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
 * The month a scrollport is resting on (or nearest to, mid-scroll).
 *
 * Returns a row offset from the top of the list, not a month index — add
 * `minMonthIndex` for that.
 */
export function rowAtScrollTop(
  scrollTop: number,
  paneBlockSize: number,
  rowCount: number,
): number {
  if (paneBlockSize <= 0) {
    return 0;
  }
  return clampIndex(Math.round(scrollTop / paneBlockSize), 0, rowCount - 1);
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
 * Only a handful of panes exist in the DOM at a time; the rest of the list is
 * a spacer. `overscan` is how many extra panes ride along on each side so a
 * fast fling never lands on an unmounted one — which under `scroll-snap-type:
 * mandatory` would be visible as a jump.
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
