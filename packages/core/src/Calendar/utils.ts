// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file utils.ts
 * @input None
 * @output Re-exports shared date utility functions for calendar components
 * @position Shared utilities; used by Calendar, CalendarMonthGrid, CalendarDayCell
 */

import {plainDateFormat, DATE_FORMAT_WITH_WEEKDAY} from '../utils/plainDate';

export {
  type PlainDate,
  plainDateFromISO as parseISO,
  plainDateToISO as dateToISO,
  plainDateIsEqual as isSameDay,
  plainDateIsInRange as isDateInRange,
  plainDateGetWeekNumber as getWeekNumber,
} from '../utils/plainDate';

export {plainDateFormat, DATE_FORMAT_WITH_WEEKDAY};

/** @deprecated Use `plainDateFormat(pd, DATE_FORMAT_WITH_WEEKDAY)` instead. */
export function formatAccessibleDate(
  ...args: Parameters<typeof plainDateFormat>
): string {
  return plainDateFormat(args[0], DATE_FORMAT_WITH_WEEKDAY);
}
