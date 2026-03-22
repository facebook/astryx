'use client';

/**
 * @file useCalendarConstraints.ts
 * @input Uses React useCallback, useMemo
 * @output Exports useCalendarConstraints hook for date validation
 * @position Calendar-specific hook; used by XDSCalendar
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Calendar/hooks/index.ts
 */


import {useCallback, useMemo} from 'react';
import type {ISODateString} from '../XDSCalendar';

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
}

/**
 * Parse ISO date string to Date object.
 */
function parseISO(str: ISODateString): Date {
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day);
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

  return {
    isDateDisabled,
    minDate,
    maxDate,
  };
}
