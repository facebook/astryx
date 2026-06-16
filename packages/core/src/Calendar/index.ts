// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports calendar components and types
 * @output Exports XDSCalendar and related types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Calendar/Calendar.doc.mjs
 */

export {XDSCalendar} from './XDSCalendar';
export type {
  XDSCalendarProps,
  XDSCalendarHandle,
  ISODateString,
  DayOfWeek,
  DateRange,
} from './XDSCalendar';

// Re-export hooks for advanced usage
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

// Re-export calendar-specific utilities for advanced usage
export {
  isSameDay,
  isDateInRange,
  getWeekNumber,
  formatAccessibleDate,
} from './utils';

// Re-export theme styles for customization


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSCalendar as Calendar,
} from '.';
export type {
  XDSCalendarHandle as CalendarHandle,
  XDSCalendarProps as CalendarProps,
} from '.';
// <compat-aliases:end>
