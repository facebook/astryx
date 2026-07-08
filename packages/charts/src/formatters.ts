// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file formatters.ts
 * @output Built-in, locale-aware tick/value format utilities for common data types
 * @position Utility; consumed by ChartAxis via tickFormat prop
 *
 * Formatters degrade gracefully: non-finite numbers (NaN/±Infinity) and
 * unparseable values are passed through as-is rather than producing garbage
 * like "InfinityB", and no input throws. Numeric/date formatting is delegated
 * to cached `Intl` formatters so output is locale-aware and rounding is correct
 * across the full magnitude range (K/M/B/T and beyond).
 */

/** Lazily create a value once and cache it — keeps `Intl` construction off the import path. */
function once<T>(create: () => T): () => T {
  let cached: {value: T} | null = null;
  return () => (cached ??= {value: create()}).value;
}

const getCompactFormat = once(
  () =>
    new Intl.NumberFormat(undefined, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }),
);

const getPercentFormat = once(
  () =>
    new Intl.NumberFormat(undefined, {
      style: 'percent',
      maximumFractionDigits: 1,
    }),
);

const getShortDateFormat = once(
  () => new Intl.DateTimeFormat(undefined, {month: 'short', day: 'numeric'}),
);

const getMonthYearFormat = once(
  () => new Intl.DateTimeFormat(undefined, {month: 'short', year: 'numeric'}),
);

/**
 * Compact number formatter (e.g. 1200 → "1.2K", 1500000 → "1.5M", 1e12 → "1T").
 *
 * Non-numeric values (e.g. category labels) and non-finite numbers pass through
 * unchanged, so it is safe to use as a general-purpose tick formatter.
 */
export function compactNumber(value: unknown): string {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return String(value);
  }
  return getCompactFormat().format(n);
}

/**
 * Currency formatter factory. Returns a tick format function.
 *
 * The symbol prefixes the magnitude and the sign leads the symbol, so negatives
 * read as "-$1.5K" rather than "$-1.5K". Large values use compact notation.
 *
 * @example
 * ```
 * <ChartAxis tickFormat={currency()} />       // $1.5K
 * <ChartAxis tickFormat={currency('€')} />    // €1.5K
 * <ChartAxis tickFormat={currency('¥')} />    // ¥1.5K
 * ```
 */
export function currency(symbol = '$'): (value: unknown) => string {
  return (value: unknown) => {
    const n = Number(value);
    if (!Number.isFinite(n)) {
      return String(value);
    }
    const sign = n < 0 ? '-' : '';
    const abs = Math.abs(n);
    const body =
      abs >= 1000 ? getCompactFormat().format(abs) : abs.toLocaleString();
    return `${sign}${symbol}${body}`;
  };
}

/**
 * Percent formatter (e.g. 0.45 → "45%", 1.2 → "120%", 0.005 → "0.5%").
 *
 * The input is a ratio; it is multiplied by 100 and localized. Whole percents
 * render without a decimal, and up to one fractional digit is shown otherwise.
 */
export function percent(value: unknown): string {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return String(value);
  }
  return getPercentFormat().format(n);
}

/**
 * Coerce a value into a Date.
 *
 * Accepts a `Date`, epoch milliseconds (number or numeric string), or a date
 * string (ISO 8601, RFC 2822, …). Returns an invalid Date for anything else so
 * callers can pass the original value through unchanged.
 *
 * Date-only ISO strings (`YYYY-MM-DD`) are constructed at local midnight rather
 * than the spec's UTC midnight, so the calendar day survives local formatting
 * in negative-offset timezones (`"2024-01-05"` stays "Jan 5", not "Jan 4").
 */
function toDate(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'number') {
    return new Date(value);
  }
  if (typeof value === 'string') {
    const s = value.trim();
    if (s === '') {
      return new Date(NaN);
    }
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (dateOnly) {
      return new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3]),
      );
    }
    const asNumber = Number(s);
    return new Date(Number.isFinite(asNumber) ? asNumber : s);
  }
  return new Date(NaN);
}

/**
 * Date formatter — short date (e.g. "Jan 5", "Mar 12").
 */
export function shortDate(value: unknown): string {
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) {
    return String(value);
  }
  return getShortDateFormat().format(d);
}

/**
 * Date formatter — month/year (e.g. "Jan 2024", "Mar 2025").
 */
export function monthYear(value: unknown): string {
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) {
    return String(value);
  }
  return getMonthYearFormat().format(d);
}
