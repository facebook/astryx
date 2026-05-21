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

export function fromISO(str: ISODateString): PlainDate {
  const [year, month, day] = str.split('-').map(Number);
  return {year, month, day};
}

export function toISO(pd: PlainDate): ISODateString {
  const y = String(pd.year).padStart(4, '0');
  const m = String(pd.month).padStart(2, '0');
  const d = String(pd.day).padStart(2, '0');
  return `${y}-${m}-${d}` as ISODateString;
}

export function toDate(pd: PlainDate): Date {
  return new Date(pd.year, pd.month - 1, pd.day);
}

export function fromDate(d: Date): PlainDate {
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  };
}

export function today(): PlainDate {
  return fromDate(new Date());
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return leap ? 29 : 28;
  }
  return [0, 31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
}

export function dayOfWeek(pd: PlainDate): number {
  return new Date(pd.year, pd.month - 1, pd.day).getDay();
}

export function addMonths(pd: PlainDate, n: number): PlainDate {
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
  const maxDay = daysInMonth(year, month);
  return {year, month, day: Math.min(pd.day, maxDay)};
}

export function addDays(pd: PlainDate, n: number): PlainDate {
  // Use Date for reliable rollover across month/year boundaries
  const d = new Date(pd.year, pd.month - 1, pd.day + n);
  return fromDate(d);
}

export function compare(a: PlainDate, b: PlainDate): number {
  if (a.year !== b.year) {
    return a.year - b.year;
  }
  if (a.month !== b.month) {
    return a.month - b.month;
  }
  return a.day - b.day;
}

export function isSameDay(a: PlainDate, b: PlainDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function isInRange(
  pd: PlainDate,
  start: PlainDate,
  end: PlainDate,
): boolean {
  return compare(pd, start) >= 0 && compare(pd, end) <= 0;
}

export function firstOfMonth(pd: PlainDate): PlainDate {
  return {year: pd.year, month: pd.month, day: 1};
}

export function getWeekNumber(pd: PlainDate): number {
  const d = new Date(Date.UTC(pd.year, pd.month - 1, pd.day));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function formatAccessible(pd: PlainDate): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(toDate(pd));
}
