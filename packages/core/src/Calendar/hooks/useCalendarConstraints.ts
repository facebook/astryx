// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useCalendarConstraints.ts
 * @input Uses React useCallback, useMemo, PlainDate utilities
 * @output Exports useCalendarConstraints hook for date validation
 * @position Calendar-specific hook; used by Calendar
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Calendar/hooks/index.ts
 */

import {useCallback, useMemo} from 'react';
import type {ISODateString} from '../../utils/dateTypes';
import {
  type PlainDate,
  plainDateFromISO,
  plainDateToDate,
  plainDateIsBefore,
  plainDateIsAfter,
} from '../../utils/plainDate';

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
  /** Check if a PlainDate is disabled */
  isDateDisabled: (date: PlainDate) => boolean;
  /** Parsed min date (or null) */
  minDate: PlainDate | null;
  /** Parsed max date (or null) */
  maxDate: PlainDate | null;
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
 *     (date) => date.getDay() !== 0, // No Sundays (receives native Date)
 *   ],
 * });
 *
 * // Check if a PlainDate can be selected
 * if (isDateDisabled({year: 2026, month: 6, day: 15})) {
 *   console.log('This date is not selectable');
 * }
 * ```
 */
export function useCalendarConstraints(
  options: UseCalendarConstraintsOptions,
): UseCalendarConstraintsReturn {
  const {min, max, dateConstraints} = options;

  // Parse min/max dates
  const minDate = useMemo(() => (min ? plainDateFromISO(min) : null), [min]);
  const maxDate = useMemo(() => (max ? plainDateFromISO(max) : null), [max]);

  // Check if a date is disabled
  const isDateDisabled = useCallback(
    (date: PlainDate): boolean => {
      // Check min bound
      if (minDate && plainDateIsBefore(date, minDate)) {
        return true;
      }

      // Check max bound
      if (maxDate && plainDateIsAfter(date, maxDate)) {
        return true;
      }

      // Check custom constraints (convert to Date for public API compatibility)
      if (dateConstraints) {
        for (const constraint of dateConstraints) {
          if (!constraint(plainDateToDate(date))) {
            return true;
          }
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
