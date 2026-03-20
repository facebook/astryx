/**
 * @file useCalendarConstraints.ts
 * @input Uses React useCallback, useMemo
 * @output Exports useCalendarConstraints hook for date validation
 * @position Calendar-specific hook; used by XDSCalendar
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Calendar/hooks/index.ts
 */

'use client';

import {useCallback, useMemo} from 'react';
import type {ISODateString} from '../XDSCalendar';
import {parseISO} from '../utils';

/**
 * Configuration for date constraints
 */
export interface UseCalendarConstraintsOptions {
  /** Minimum selectable date in ISO format */
  min?: ISODateString;
  /** Maximum selectable date in ISO format */
  max?: ISODateString;
  /**
   * Custom date constraint functions.
   * Date is disabled if ANY function returns false.
   */
  dateConstraints?: ReadonlyArray<(date: Date) => boolean>;
}

/**
 * Return type for useCalendarConstraints hook
 */
export interface UseCalendarConstraintsReturn {
  /** Check if a date is disabled */
  isDateDisabled: (date: Date) => boolean;
  /** Parsed min date (or null) */
  minDate: Date | null;
  /** Parsed max date (or null) */
  maxDate: Date | null;
  /** Whether navigation to previous month is possible given the visible months */
  canNavigatePrevious: (visibleMonths: Date[]) => boolean;
  /** Whether navigation to next month is possible given the visible months */
  canNavigateNext: (visibleMonths: Date[]) => boolean;
}

/**
 * Hook for managing calendar date validation constraints.
 *
 * Provides a function to check if a date is disabled based on
 * min/max bounds and custom constraint functions.
 *
 * @example
 * ```
 * const {isDateDisabled} = useCalendarConstraints({
 *   min: '2026-01-01',
 *   max: '2026-12-31',
 *   dateConstraints: [
 *     (date) => date.getDay() !== 0, // No Sundays
 *   ],
 * });
 *
 * // Check if a date can be selected
 * if (isDateDisabled(someDate)) {
 *   console.log('This date is not selectable');
 * }
 * ```
 */
export function useCalendarConstraints(
  options: UseCalendarConstraintsOptions,
): UseCalendarConstraintsReturn {
  const {min, max, dateConstraints} = options;

  // Parse min/max dates
  const minDate = useMemo(() => (min ? parseISO(min) : null), [min]);
  const maxDate = useMemo(() => (max ? parseISO(max) : null), [max]);

  // Check if a date is disabled
  const isDateDisabled = useCallback(
    (date: Date): boolean => {
      // Check min bound
      if (minDate && date < minDate) return true;

      // Check max bound
      if (maxDate && date > maxDate) return true;

      // Check custom constraints
      if (dateConstraints) {
        for (const constraint of dateConstraints) {
          if (!constraint(date)) return true;
        }
      }

      return false;
    },
    [minDate, maxDate, dateConstraints],
  );

  // Check if navigation to previous month is possible
  const canNavigatePrevious = useCallback(
    (visibleMonths: Date[]): boolean => {
      if (!minDate) return true;
      const firstVisible = visibleMonths[0];
      // Can navigate if min month is before the first visible month
      return (
        minDate.getFullYear() < firstVisible.getFullYear() ||
        (minDate.getFullYear() === firstVisible.getFullYear() &&
          minDate.getMonth() < firstVisible.getMonth())
      );
    },
    [minDate],
  );

  // Check if navigation to next month is possible
  const canNavigateNext = useCallback(
    (visibleMonths: Date[]): boolean => {
      if (!maxDate) return true;
      const lastVisible = visibleMonths[visibleMonths.length - 1];
      // Can navigate if max month is after the last visible month
      return (
        maxDate.getFullYear() > lastVisible.getFullYear() ||
        (maxDate.getFullYear() === lastVisible.getFullYear() &&
          maxDate.getMonth() > lastVisible.getMonth())
      );
    },
    [maxDate],
  );

  return {
    isDateDisabled,
    minDate,
    maxDate,
    canNavigatePrevious,
    canNavigateNext,
  };
}
