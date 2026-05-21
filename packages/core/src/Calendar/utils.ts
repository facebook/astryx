// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file utils.ts
 * @input None
 * @output Re-exports shared date utility functions for calendar components
 * @position Shared utilities; used by XDSCalendar, XDSCalendarMonthGrid, XDSCalendarDayCell
 */

export {
  type PlainDate,
  fromISO as parseISO,
  toISO as dateToISO,
  isSameDay,
  isInRange as isDateInRange,
  getWeekNumber,
  formatAccessible as formatAccessibleDate,
} from '../utils/plainDate';
