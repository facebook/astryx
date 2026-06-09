// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @output Public API for the Calendar component
 * @position Entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update /packages/core/src/index.ts
 */

export {XDSCalendar} from './XDSCalendar';
export type {
  XDSCalendarProps,
  XDSCalendarHandle,
  ISODateString,
  DayOfWeek,
  DateRange,
} from './XDSCalendar';

// Hooks for advanced usage
export {
  useCalendarDays,
  useCalendarConstraints,
  useCalendarNavigation,
  useCalendarRovingTabindex,
} from './hooks';
export type {
  CalendarDay,
  UseCalendarDaysOptions,
  UseCalendarDaysReturn,
  UseCalendarConstraintsOptions,
  UseCalendarConstraintsReturn,
  UseCalendarNavigationOptions,
  UseCalendarNavigationReturn,
  UseCalendarRovingTabindexOptions,
  UseCalendarRovingTabindexReturn,
} from './hooks';

// Calendar-specific utilities for advanced usage
export {
  isSameDay,
  isDateInRange,
  getWeekNumber,
  formatAccessibleDate,
} from './utils';
