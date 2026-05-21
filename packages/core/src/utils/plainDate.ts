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
  if (month < 1 || month > 12) {
    throw new RangeError(`month must be 1–12, got ${month}`);
  }
  const maxDay = getDaysInMonth(year, month);
  if (day < 1 || day > maxDay) {
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
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return leap ? 29 : 28;
  }
  return [0, 31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
}

export function plainDateDayOfWeek(pd: PlainDate): number {
  return plainDateToDate(pd).getDay();
}

export function plainDateAddMonths(pd: PlainDate, n: number): PlainDate {
  const d = new Date(pd.year, pd.month - 1 + n, 1);
  const maxDay = getDaysInMonth(d.getFullYear(), d.getMonth() + 1);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: Math.min(pd.day, maxDay),
  };
}

export function plainDateAddDays(pd: PlainDate, n: number): PlainDate {
  const d = new Date(pd.year, pd.month - 1, pd.day + n);
  return plainDateFromDate(d);
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

export function plainDateIsInRange(
  pd: PlainDate,
  range: [PlainDate, PlainDate],
): boolean {
  return compare(pd, range[0]) >= 0 && compare(pd, range[1]) <= 0;
}

export function plainDateSetFirstOfMonth(pd: PlainDate): PlainDate {
  return {year: pd.year, month: pd.month, day: 1};
}

export function plainDateGetWeekNumber(pd: PlainDate): number {
  const d = plainDateToDate(pd);
  const dayNum = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - dayNum);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function plainDateFormatAccessible(pd: PlainDate): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(plainDateToDate(pd));
}

export function plainDateFormatDisplay(pd: PlainDate): string {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(plainDateToDate(pd));
}
