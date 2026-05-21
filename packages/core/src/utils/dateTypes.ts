// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dateTypes.ts
 * @input None
 * @output Shared date type definitions used across Calendar, DateInput, and other components
 * @position Core type definitions; imported by Calendar, DateInput, DateRangeInput, DateTimeInput, plainDate, dateParser
 */

/**
 * ISO 8601 date string in YYYY-MM-DD format.
 * Example: "2026-01-28"
 */
export type ISODateString =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

/** Day of week: 0 = Sunday through 6 = Saturday */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Date range with start and end dates */
export interface DateRange {
  start: ISODateString;
  end: ISODateString;
}
