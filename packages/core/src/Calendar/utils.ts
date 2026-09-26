// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file utils.ts
 * @input None
 * @output Re-exports shared date utility functions for calendar components
 * @position Shared utilities; used by Calendar, CalendarMonthGrid, CalendarDayCell
 */

export {
  type PlainDate,
  plainDateFromISO as parseISO,
  plainDateToISO as dateToISO,
  plainDateIsEqual as isSameDay,
  plainDateIsInRange as isDateInRange,
  plainDateGetWeekNumber as getWeekNumber,
} from '../utils/plainDate';
