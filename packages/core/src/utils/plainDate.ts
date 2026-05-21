// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file plainDate.ts
 * @input ISO date strings, year/month/day numbers
 * @output Immutable PlainDate records and pure date arithmetic
 * @position Shared utility; replaces scattered Date usage across Calendar hooks
 */

import type {ISODateString} from '../Calendar/XDSCalendar';

export interface PlainDate {
  readonly year: number;
  /** 1-based (1 = January, 12 = December) */
  readonly month: number;
  readonly day: number;
}

export function plainDateFromISO(str: ISODateString): PlainDate {
  const [year, month, day] = str.split('-').map(Number);
  return {year, month, day};
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

export function plainDateDaysInMonth(year: number, month: number): number {
  if (month === 2) {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return leap ? 29 : 28;
  }
  return [0, 31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
}

export function plainDateDayOfWeek(pd: PlainDate): number {
  return new Date(pd.year, pd.month - 1, pd.day).getDay();
}

export function plainDateAddMonths(pd: PlainDate, n: number): PlainDate {
  let month = pd.month + n;
  let year = pd.year;
  while (month > 12) {
    month -= 12;
    year++;
  }
  while (month < 1) {
    month += 12;
    year--;
  }
  const maxDay = plainDateDaysInMonth(year, month);
  return {year, month, day: Math.min(pd.day, maxDay)};
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

export function plainDateIsSameDay(a: PlainDate, b: PlainDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function plainDateIsInRange(
  pd: PlainDate,
  start: PlainDate,
  end: PlainDate,
): boolean {
  return compare(pd, start) >= 0 && compare(pd, end) <= 0;
}

export function plainDateFirstOfMonth(pd: PlainDate): PlainDate {
  return {year: pd.year, month: pd.month, day: 1};
}

export function plainDateGetWeekNumber(pd: PlainDate): number {
  const d = new Date(Date.UTC(pd.year, pd.month - 1, pd.day));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
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
