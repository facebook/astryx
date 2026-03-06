/**
 * @file useCalendarNavigation.ts
 * @input Uses React useState, useMemo, useCallback
 * @output Exports useCalendarNavigation hook for month navigation
 * @position Calendar-specific hook; used by XDSCalendar
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Calendar/hooks/index.ts
 */

'use client';

import {useState, useMemo, useCallback} from 'react';
import type {ISODateString} from '../XDSCalendar';

/**
 * Configuration for calendar navigation
 */
export interface UseCalendarNavigationOptions {
  /** Initial value to determine starting month */
  initialValue?: ISODateString;
  /** Controlled focus date (which month is visible) */
  focusDate?: ISODateString;
  /** Callback when visible month changes */
  onFocusDateChange?: (focusDate: ISODateString) => void;
  /** Number of months to display */
  numberOfMonths?: 1 | 2;
}

/**
 * Return type for useCalendarNavigation hook
 */
export interface UseCalendarNavigationReturn {
  /** The base month (first day of the focus month) */
  baseMonth: Date;
  /** Array of visible months to render */
  visibleMonths: Date[];
  /** Formatted label for the month header */
  monthYearLabel: string;
  /** Navigate to previous/next month */
  navigateMonth: (
    delta: number,
    focusedDate?: ISODateString,
    offset?: number,
  ) => void;
  /** Target date to focus after navigation */
  pendingFocus: ISODateString | null;
  /** Clear the pending focus */
  clearPendingFocus: () => void;
}

/**
 * Convert a Date to ISO date string format.
 */
function dateToISO(date: Date): ISODateString {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}` as ISODateString;
}

/**
 * Parse ISO date string to Date object.
 */
function parseISO(str: ISODateString): Date {
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Hook for managing calendar month navigation.
 *
 * Handles the current focus date (which month is visible), previous/next
 * navigation, and pending focus for keyboard navigation across months.
 *
 * @example
 * ```
 * const {
 *   visibleMonths,
 *   monthYearLabel,
 *   navigateMonth,
 *   pendingFocus,
 *   clearPendingFocus,
 * } = useCalendarNavigation({
 *   initialValue: '2026-01-15',
 *   numberOfMonths: 1,
 * });
 *
 * // Navigate to next month
 * navigateMonth(1);
 *
 * // Navigate from arrow key (with focus tracking)
 * navigateMonth(1, focusedDate, 1); // horizontal offset
 * navigateMonth(1, focusedDate, 7); // vertical offset
 * ```
 */
export function useCalendarNavigation(
  options: UseCalendarNavigationOptions,
): UseCalendarNavigationReturn {
  const {
    initialValue,
    focusDate: focusDateProp,
    onFocusDateChange,
    numberOfMonths = 1,
  } = options;

  // Pending focus target after month navigation
  const [pendingFocus, setPendingFocus] = useState<ISODateString | null>(null);

  // Internal focus date state
  const [internalFocusDate, setInternalFocusDate] = useState<Date>(() => {
    if (focusDateProp) return parseISO(focusDateProp);
    if (initialValue) return parseISO(initialValue);
    return new Date();
  });

  // Determine if focus is controlled
  const isControlledFocus =
    focusDateProp !== undefined && onFocusDateChange !== undefined;
  const focusDate = isControlledFocus
    ? parseISO(focusDateProp)
    : internalFocusDate;

  // Base month (first day of focus month)
  const baseMonth = useMemo(() => {
    const d = new Date(focusDate);
    d.setDate(1);
    return d;
  }, [focusDate]);

  // Generate visible months
  const visibleMonths = useMemo(() => {
    return Array.from({length: numberOfMonths}, (_, i) => {
      const m = new Date(baseMonth);
      m.setMonth(baseMonth.getMonth() + i);
      return m;
    });
  }, [baseMonth, numberOfMonths]);

  // Format month header
  const monthYearLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
    });
    if (numberOfMonths === 1) {
      return formatter.format(visibleMonths[0]);
    }
    return visibleMonths.map(m => formatter.format(m)).join(' – ');
  }, [visibleMonths, numberOfMonths]);

  // Navigate to previous/next month
  const navigateMonth = useCallback(
    (delta: number, focusedDate?: ISODateString, offset?: number) => {
      const newDate = new Date(baseMonth);
      newDate.setMonth(baseMonth.getMonth() + delta);
      const newISO = dateToISO(newDate);

      // Calculate target focus date if provided
      if (focusedDate) {
        const currentDate = parseISO(focusedDate);
        // Use the provided offset (1 for horizontal, 7 for vertical)
        const daysToMove = offset ?? 7;
        currentDate.setDate(currentDate.getDate() + delta * daysToMove);
        setPendingFocus(dateToISO(currentDate));
      }

      if (onFocusDateChange) {
        onFocusDateChange(newISO);
      } else {
        setInternalFocusDate(newDate);
      }
    },
    [baseMonth, onFocusDateChange],
  );

  // Clear pending focus
  const clearPendingFocus = useCallback(() => {
    setPendingFocus(null);
  }, []);

  return {
    baseMonth,
    visibleMonths,
    monthYearLabel,
    navigateMonth,
    pendingFocus,
    clearPendingFocus,
  };
}
