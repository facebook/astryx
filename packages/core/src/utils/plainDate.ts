// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file plainDate.ts
 * @input ISO date strings, year/month/day numbers
 * @output Immutable PlainDate records and pure date arithmetic
 * @position Shared utility; replaces scattered Date usage across Calendar hooks
 */

import type {ISODateString, PlainDate} from './dateTypes';

export type {PlainDate} from './dateTypes';

export function plainDateCreate(
  year: number,
  month: number,
  day: number,
): PlainDate {
  if (!Number.isInteger(year) || year < 1) {
    throw new RangeError(`year must be a positive integer, got ${year}`);
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError(`month must be 1–12, got ${month}`);
  }
  const maxDay = getDaysInMonth(year, month);
  if (!Number.isInteger(day) || day < 1 || day > maxDay) {
    throw new RangeError(
      `day must be 1–${maxDay} for ${year}-${String(month).padStart(2, '0')}, got ${day}`,
    );
  }
  return {year, month, day};
}

export function plainDateFromISO(str: ISODateString): PlainDate {
  const [year, month, day] = str.split('-').map(Number);
  return plainDateCreate(year, month, day);
}

export function plainDateToISO(pd: PlainDate): ISODateString {
  const y = String(pd.year).padStart(4, '0');
  const m = String(pd.month).padStart(2, '0');
  const d = String(pd.day).padStart(2, '0');
  return `${y}-${m}-${d}` as ISODateString;
}

export function plainDateToDate(pd: PlainDate): Date {
  return new Date(pd.year, pd.month - 1, pd.day);
}

export function plainDateFromDate(d: Date): PlainDate {
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  };
}

export function plainDateToday(): PlainDate {
  return plainDateFromDate(new Date());
}

export function getDaysInMonth(year: number, month: number): number {
  if (month === 2) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return isLeap ? 29 : 28;
  }
  return [0, 31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
}

export function plainDateDayOfWeek(pd: PlainDate): number {
  return plainDateToDate(pd).getDay();
}

export function plainDateAddMonths(pd: PlainDate, n: number): PlainDate {
  // Pure month arithmetic with day clamping (Temporal.PlainDate.add
  // semantics): Jan 31 + 1 month is Feb 28/29, not Mar 2/3. Date#setMonth
  // would overflow the excess days into the following month instead.
  const totalMonths = pd.year * 12 + (pd.month - 1) + n;
  const year = Math.floor(totalMonths / 12);
  const month = (((totalMonths % 12) + 12) % 12) + 1;
  const day = Math.min(pd.day, getDaysInMonth(year, month));
  return {year, month, day};
}

export function plainDateAddDays(pd: PlainDate, n: number): PlainDate {
  const d = plainDateToDate(pd);
  d.setDate(d.getDate() + n);
  return plainDateFromDate(d);
}

function getTimeZoneParts(
  instant: number,
  timezoneID: string,
): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezoneID,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(instant));

  const lookup = Object.fromEntries(
    parts
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, Number(part.value)]),
  );

  return {
    year: lookup.year,
    month: lookup.month,
    day: lookup.day,
    hour: lookup.hour,
    minute: lookup.minute,
    second: lookup.second,
  };
}

function getTimezoneOffsetMS(timezoneID: string, instant: number): number {
  const parts = getTimeZoneParts(instant, timezoneID);
  return (
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    ) - instant
  );
}

export function plainDateToInstant(
  date: PlainDate,
  timezoneID: string,
  hour = 0,
  minute = 0,
): number {
  const utcGuess = Date.UTC(date.year, date.month - 1, date.day, hour, minute);
  const firstOffset = getTimezoneOffsetMS(timezoneID, utcGuess);
  const firstInstant = utcGuess - firstOffset;
  const secondOffset = getTimezoneOffsetMS(timezoneID, firstInstant);
  return utcGuess - secondOffset;
}

export function plainDateFromInstant(
  instant: number,
  timezoneID: string,
): PlainDate {
  const parts = getTimeZoneParts(instant, timezoneID);
  return plainDateCreate(parts.year, parts.month, parts.day);
}

function compare(a: PlainDate, b: PlainDate): number {
  if (a.year !== b.year) {
    return a.year - b.year;
  }
  if (a.month !== b.month) {
    return a.month - b.month;
  }
  return a.day - b.day;
}

export function plainDateIsBefore(a: PlainDate, b: PlainDate): boolean {
  return compare(a, b) < 0;
}

export function plainDateIsAfter(a: PlainDate, b: PlainDate): boolean {
  return compare(a, b) > 0;
}

export function plainDateIsEqual(a: PlainDate, b: PlainDate): boolean {
  return compare(a, b) === 0;
}

export function plainDateMax(a: PlainDate, b: PlainDate): PlainDate {
  return compare(a, b) >= 0 ? a : b;
}

export function plainDateMin(a: PlainDate, b: PlainDate): PlainDate {
  return compare(a, b) <= 0 ? a : b;
}

export function plainDateIsInRange(
  pd: PlainDate,
  range: [PlainDate, PlainDate],
): boolean {
  return compare(pd, range[0]) >= 0 && compare(pd, range[1]) <= 0;
}

export function plainDateSetFirstOfMonth(pd: PlainDate): PlainDate {
  return {year: pd.year, month: pd.month, day: 1};
}

export function plainDateSetStartOfWeek(
  pd: PlainDate,
  weekStartsOn: number,
): PlainDate {
  const day = plainDateDayOfWeek(pd);
  const delta = (day - weekStartsOn + 7) % 7;
  return plainDateAddDays(pd, -delta);
}

export function plainDateSetEndOfWeekExclusive(
  pd: PlainDate,
  weekStartsOn: number,
): PlainDate {
  return plainDateAddDays(plainDateSetStartOfWeek(pd, weekStartsOn), 7);
}

export function plainDateGetWeekNumber(pd: PlainDate): number {
  const d = plainDateToDate(pd);
  const dayNum = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - dayNum);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// e.g. "Wednesday, May 21, 2026" (locale-dependent)
export const DATE_FORMAT_WITH_WEEKDAY: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

// e.g. "May 21, 2026" (locale-dependent)
export const DATE_FORMAT_LONG: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

// e.g. "January 2026" (locale-dependent)
export const DATE_FORMAT_MONTH_YEAR: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
};

// e.g. "Jan 25" (locale-dependent)
export const DATE_FORMAT_SHORT: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
};

// e.g. "Jan 25, 2026" (locale-dependent)
export const DATE_FORMAT_SHORT_WITH_YEAR: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

export function plainDateFormat(
  pd: PlainDate,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(undefined, options).format(
    plainDateToDate(pd),
  );
}
