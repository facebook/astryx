// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports calendar components and types
 * @output Exports Calendar and related types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Calendar/Calendar.doc.mjs
 */

export {Calendar} from './Calendar';
export type {
  CalendarProps,
  CalendarHandle,
  ISODateString,
  DayOfWeek,
  DateRange,
} from './Calendar';

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
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Calendar as XDSCalendar,
  useCalendarConstraints as useXDSCalendarConstraints,
  useCalendarDays as useXDSCalendarDays,
  useCalendarNavigation as useXDSCalendarNavigation,
  useCalendarRovingTabindex as useXDSCalendarRovingTabindex,
} from '.';
export type {
  CalendarDay as XDSCalendarDay,
  CalendarHandle as XDSCalendarHandle,
  CalendarProps as XDSCalendarProps,
  DateRange as XDSDateRange,
  DayOfWeek as XDSDayOfWeek,
  ISODateString as XDSISODateString,
  UseCalendarConstraintsOptions as XDSUseCalendarConstraintsOptions,
  UseCalendarConstraintsReturn as XDSUseCalendarConstraintsReturn,
  UseCalendarDaysOptions as XDSUseCalendarDaysOptions,
  UseCalendarDaysReturn as XDSUseCalendarDaysReturn,
  UseCalendarNavigationOptions as XDSUseCalendarNavigationOptions,
  UseCalendarNavigationReturn as XDSUseCalendarNavigationReturn,
  UseCalendarRovingTabindexOptions as XDSUseCalendarRovingTabindexOptions,
  UseCalendarRovingTabindexReturn as XDSUseCalendarRovingTabindexReturn,
} from '.';
// <compat-aliases:end>
