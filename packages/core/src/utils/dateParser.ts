/**
 * @file dateParser.ts
 * @input Uses Intl.DateTimeFormat for locale detection
 * @output Exports date parsing utilities for user input
 * @position Core utility; used by XDSDatePicker
 *
 * SYNC: When modified, update:
 * - /packages/core/src/utils/dateParser.test.ts
 * - /packages/core/src/utils/index.ts
 */

import type {ISODateString} from '../Calendar';

/**
 * Detects if the user's locale uses day-first date format (DD/MM/YYYY).
 * US and a few others use month-first (MM/DD/YYYY).
 */
export function isLocaleDayFirst(): boolean {
  const parts = new Intl.DateTimeFormat().formatToParts(new Date(2000, 0, 15));
  const dayIndex = parts.findIndex(p => p.type === 'day');
  const monthIndex = parts.findIndex(p => p.type === 'month');
  return dayIndex < monthIndex;
}

/**
 * Parses user input into an ISO date string.
 *
 * Supports:
 * - ISO format: "2026-01-25"
 * - Full month names: "January 25, 2026", "25 January 2026"
 * - Full month names without year: "January 25", "25 January" (defaults to current year)
 * - Numeric formats: "1/25/2026", "25/1/2026" (locale-aware with heuristics)
 * - Numeric formats without year: "1/25", "25/1" (defaults to current year)
 *
 * For ambiguous numeric formats (both numbers ≤ 12), uses locale preference.
 *
 * @returns ISODateString if valid, null if unparseable
 */
export function parseDateInput(input: string): ISODateString | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const currentYear = new Date().getFullYear();

  // 1. Try ISO format first (YYYY-MM-DD) - always unambiguous
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return createISODate(+year, +month, +day);
  }

  // 2. Try full month name formats with year
  // "January 25, 2026" or "Jan 25, 2026"
  const monthFirstWithYearMatch = trimmed.match(
    /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/,
  );
  if (monthFirstWithYearMatch) {
    const [, monthName, day, year] = monthFirstWithYearMatch;
    const month = parseMonthName(monthName);
    if (month !== null) {
      return createISODate(+year, month, +day);
    }
  }

  // "25 January 2026" or "25 Jan 2026"
  const dayFirstWithYearMatch = trimmed.match(
    /^(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})$/,
  );
  if (dayFirstWithYearMatch) {
    const [, day, monthName, year] = dayFirstWithYearMatch;
    const month = parseMonthName(monthName);
    if (month !== null) {
      return createISODate(+year, month, +day);
    }
  }

  // 3. Try full month name formats WITHOUT year (defaults to current year)
  // "January 25" or "Jan 25"
  const monthFirstNoYearMatch = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2})$/);
  if (monthFirstNoYearMatch) {
    const [, monthName, day] = monthFirstNoYearMatch;
    const month = parseMonthName(monthName);
    if (month !== null) {
      return createISODate(currentYear, month, +day);
    }
  }

  // "25 January" or "25 Jan"
  const dayFirstNoYearMatch = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+)$/);
  if (dayFirstNoYearMatch) {
    const [, day, monthName] = dayFirstNoYearMatch;
    const month = parseMonthName(monthName);
    if (month !== null) {
      return createISODate(currentYear, month, +day);
    }
  }

  // 4. Try numeric formats with separators (/, -, .) WITH year
  const numericWithYearMatch = trimmed.match(
    /^(\d{1,2})([-/.])(\d{1,2})([-/.])(\d{4})$/,
  );
  if (numericWithYearMatch) {
    const [, first, sep1, second, sep2, year] = numericWithYearMatch;
    // Reject mixed separators (e.g., "1/25.2026")
    if (sep1 !== sep2) return null;
    return parseNumericDate(+first, +second, +year);
  }

  // 5. Try numeric formats WITHOUT year (defaults to current year)
  const numericNoYearMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})$/);
  if (numericNoYearMatch) {
    const [, first, second] = numericNoYearMatch;
    return parseNumericDate(+first, +second, currentYear);
  }

  // 6. Fall back to native Date parsing for other formats
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return dateToISO(parsed);
  }

  return null;
}

/**
 * Parses ambiguous numeric dates using heuristics and locale.
 *
 * Heuristics:
 * - If first > 12, it must be the day (e.g., 25/1/2026 → Jan 25)
 * - If second > 12, it must be the day (e.g., 1/25/2026 → Jan 25)
 * - If both ≤ 12, use locale preference (day-first vs month-first)
 */
function parseNumericDate(
  first: number,
  second: number,
  year: number,
): ISODateString | null {
  let day: number;
  let month: number;

  if (first > 12 && second <= 12) {
    // First must be day (e.g., 25/1/2026)
    day = first;
    month = second;
  } else if (second > 12 && first <= 12) {
    // Second must be day (e.g., 1/25/2026)
    month = first;
    day = second;
  } else if (first > 12 && second > 12) {
    // Both > 12 is invalid
    return null;
  } else {
    // Both ≤ 12: ambiguous, use locale preference
    if (isLocaleDayFirst()) {
      day = first;
      month = second;
    } else {
      month = first;
      day = second;
    }
  }

  return createISODate(year, month, day);
}

/**
 * Parses month name (full or abbreviated) to 1-12.
 */
function parseMonthName(name: string): number | null {
  const months: Record<string, number> = {
    january: 1,
    jan: 1,
    february: 2,
    feb: 2,
    march: 3,
    mar: 3,
    april: 4,
    apr: 4,
    may: 5,
    june: 6,
    jun: 6,
    july: 7,
    jul: 7,
    august: 8,
    aug: 8,
    september: 9,
    sep: 9,
    sept: 9,
    october: 10,
    oct: 10,
    november: 11,
    nov: 11,
    december: 12,
    dec: 12,
  };
  return months[name.toLowerCase()] ?? null;
}

/**
 * Creates an ISO date string, validating the date is real.
 */
function createISODate(
  year: number,
  month: number,
  day: number,
): ISODateString | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  // new Date(year, ...) treats 0-99 as 1900s; fix with setFullYear
  date.setFullYear(year);

  // Validate the date didn't overflow (e.g., Feb 30 → Mar 2)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return dateToISO(date);
}

/**
 * Converts a Date object to ISO date string.
 */
export function dateToISO(date: Date): ISODateString {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}` as ISODateString;
}

/**
 * Parses an ISO date string into a Date object.
 */
export function parseISO(iso: ISODateString): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formats an ISO date string for display.
 * Uses locale-aware formatting with full month name.
 *
 * @example
 * ```
 * formatDisplayDate("2026-01-25") // "January 25, 2026"
 * ```
 */
export function formatDisplayDate(iso: ISODateString): string {
  const date = parseISO(iso);
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
