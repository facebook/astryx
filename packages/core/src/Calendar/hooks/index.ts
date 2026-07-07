// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Imports calendar-specific hooks
 * @output Exports all calendar hooks
 * @position Calendar hooks entry point; used by Calendar
 *
 * SYNC: When modified, update this header
 */

export {useCalendarDays} from './useCalendarDays';
export type {
  CalendarDay,
  UseCalendarDaysOptions,
  UseCalendarDaysReturn,
} from './useCalendarDays';

export {useCalendarConstraints} from './useCalendarConstraints';
export type {
  UseCalendarConstraintsOptions,
  UseCalendarConstraintsReturn,
} from './useCalendarConstraints';

export {useCalendarNavigation} from './useCalendarNavigation';
export type {
  UseCalendarNavigationOptions,
  UseCalendarNavigationReturn,
} from './useCalendarNavigation';
