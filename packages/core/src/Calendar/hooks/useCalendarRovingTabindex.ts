'use client';

/**
 * @file useCalendarRovingTabindex.ts
 * @input Uses React useMemo
 * @output Exports useCalendarRovingTabindex hook for accessible grid navigation
 * @position Calendar-specific hook; used by XDSCalendar
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Calendar/hooks/index.ts
 */

import {useMemo} from 'react';
import type {ISODateString} from '../XDSCalendar';
import type {CalendarDay} from './useCalendarDays';

/**
 * Configuration for calendar roving tabindex
 */
export interface UseCalendarRovingTabindexOptions {
  /** All days in the grid */
  days: CalendarDay[];
  /** Today's date */
  today: Date;
  /** The year being displayed */
  year: number;
  /** The month being displayed (0-11) */
  month: number;
  /** Function to check if a date is disabled */
  isDateDisabled: (date: Date) => boolean;
  /** Currently selected date (if any) */
  selectedDate?: Date | null;
}

/**
 * Return type for useCalendarRovingTabindex hook
 */
export interface UseCalendarRovingTabindexReturn {
  /** The ISO date string of the tabbable element, or null */
  tabbableDate: ISODateString | null;
  /** Check if a specific date is the tabbable one */
  isTabbable: (iso: ISODateString) => boolean;
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
 * Hook for managing roving tabindex in calendar grids.
 *
 * Implements the WAI-ARIA roving tabindex pattern where only one element
 * in a group has tabindex="0" while others have tabindex="-1".
 *
 * Priority for tabbable element:
 * 1. Today if visible in the current month and enabled
 * 2. First enabled day in the month
 *
 * @example
 * ```
 * const {tabbableDate, isTabbable} = useCalendarRovingTabindex({
 *   days,
 *   today: new Date(),
 *   year: 2026,
 *   month: 0,
 *   isDateDisabled,
 * });
 *
 * // In day rendering:
 * <button tabIndex={isTabbable(day.iso) ? 0 : -1}>
 *   {day.dayNumber}
 * </button>
 * ```
 */
export function useCalendarRovingTabindex(
  options: UseCalendarRovingTabindexOptions,
): UseCalendarRovingTabindexReturn {
  const {days, today, year, month, isDateDisabled, selectedDate} = options;

  // Determine which day should be tabbable
  const tabbableDate = useMemo(() => {
    // Priority 1: Selected date if visible in this month and enabled
    if (selectedDate) {
      const isSelectedInMonth =
        selectedDate.getFullYear() === year &&
        selectedDate.getMonth() === month;
      if (isSelectedInMonth && !isDateDisabled(selectedDate)) {
        return dateToISO(selectedDate);
      }
    }

    // Priority 2: Today if visible in this month and enabled
    const isTodayInMonth =
      today.getFullYear() === year && today.getMonth() === month;

    if (isTodayInMonth && !isDateDisabled(today)) {
      return dateToISO(today);
    }

    // Priority 3: First enabled day in this month
    for (const day of days) {
      if (!day.isOutside && !isDateDisabled(day.date)) {
        return day.iso;
      }
    }

    return null;
  }, [days, today, year, month, isDateDisabled, selectedDate]);

  // Check if a specific date is tabbable
  const isTabbable = useMemo(() => {
    return (iso: ISODateString): boolean => {
      return tabbableDate !== null && iso === tabbableDate;
    };
  }, [tabbableDate]);

  return {
    tabbableDate,
    isTabbable,
  };
}
