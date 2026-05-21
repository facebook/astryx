// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file utils.ts
 * @input None
 * @output Re-exports shared date utility functions for calendar components
 * @position Shared utilities; used by XDSCalendar, XDSCalendarMonthGrid, XDSCalendarDayCell
 */

export {
  type PlainDate,
  plainDateFromISO as parseISO,
  plainDateToISO as dateToISO,
  plainDateIsSameDay as isSameDay,
  plainDateIsInRange as isDateInRange,
  plainDateGetWeekNumber as getWeekNumber,
  plainDateFormatAccessible as formatAccessibleDate,
} from '../utils/plainDate';
