/**
 * @file useCalendarDays.ts
 * @input Uses React useMemo
 * @output Exports useCalendarDays hook for generating calendar day grids
 * @position Calendar-specific hook; used by XDSCalendar
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Calendar/hooks/index.ts
 */

'use client';

import {useMemo} from 'react';
import type {DayOfWeek, ISODateString} from '../XDSCalendar';

/**
 * Represents a single day in the calendar grid.
 */
export interface CalendarDay {
  /** The date object for this day */
  date: Date;
  /** ISO date string (YYYY-MM-DD) */
  iso: ISODateString;
  /** Whether this day is outside the current month */
  isOutside: boolean;
  /** The day number (1-31) */
  dayNumber: number;
}

/**
 * Configuration for calendar days generation
 */
export interface UseCalendarDaysOptions {
  /** The year to generate days for */
  year: number;
  /** The month index (0-11) */
  month: number;
  /** First day of week (0=Sunday through 6=Saturday) */
  weekStartsOn?: DayOfWeek;
  /** Use variable rows per month vs. fixed 6-row grid */
  hasVariableRowCount?: boolean;
}

/**
 * Return type for useCalendarDays hook
 */
export interface UseCalendarDaysReturn {
  /** All days in the grid (includes outside days) */
  days: CalendarDay[];
  /** Days grouped into weeks */
  weeks: CalendarDay[][];
  /** Localized day names for the header */
  dayNames: string[];
  /** Total number of cells in the grid */
  totalCells: number;
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
 * Hook for generating calendar day grids.
 *
 * Calculates all the days to display for a given month, including
 * days from adjacent months to fill the grid.
 *
 * @example
 * ```
 * const {days, weeks, dayNames} = useCalendarDays({
 *   year: 2026,
 *   month: 0, // January
 *   weekStartsOn: 0, // Sunday
 * });
 * ```
 */
export function useCalendarDays(
  options: UseCalendarDaysOptions,
): UseCalendarDaysReturn {
  const {year, month, weekStartsOn = 0, hasVariableRowCount = false} = options;

  // Calculate grid structure
  const gridInfo = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Calculate starting offset based on weekStartsOn
    let startingDayOfWeek = firstDayOfMonth.getDay() - weekStartsOn;
    if (startingDayOfWeek < 0) startingDayOfWeek += 7;

    // Calculate total cells
    const totalDays = daysInMonth + startingDayOfWeek;
    const totalRows = hasVariableRowCount ? Math.ceil(totalDays / 7) : 6;
    const totalCells = totalRows * 7;

    return {
      daysInMonth,
      startingDayOfWeek,
      totalCells,
    };
  }, [year, month, weekStartsOn, hasVariableRowCount]);

  // Generate day names
  const dayNames = useMemo(() => {
    const names = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const rotated: string[] = [];
    for (let i = 0; i < 7; i++) {
      rotated.push(names[(i + weekStartsOn) % 7]);
    }
    return rotated;
  }, [weekStartsOn]);

  // Generate days array
  const days = useMemo(() => {
    const {daysInMonth, startingDayOfWeek, totalCells} = gridInfo;
    const result: CalendarDay[] = [];

    for (let i = 0; i < totalCells; i++) {
      const dayOffset = i - startingDayOfWeek + 1;
      const date = new Date(year, month, dayOffset);
      const isOutside = dayOffset < 1 || dayOffset > daysInMonth;

      result.push({
        date,
        iso: dateToISO(date),
        isOutside,
        dayNumber: date.getDate(),
      });
    }

    return result;
  }, [year, month, gridInfo]);

  // Group days into weeks
  const weeks = useMemo(() => {
    const result: CalendarDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  return {
    days,
    weeks,
    dayNames,
    totalCells: gridInfo.totalCells,
  };
}
