// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file formatters.ts
 * @output Built-in tick format utilities for common data types
 * @position Utility; consumed by ChartAxis via tickFormat prop
 */

/**
 * Compact number formatter (e.g. 1200 → "1.2K", 1500000 → "1.5M")
 */
export function compactNumber(value: unknown): string {
  const n = Number(value);
  if (isNaN(n)) {
    return String(value);
  }
  if (Math.abs(n) >= 1_000_000_000) {
    return `${strip(n / 1_000_000_000)}B`;
  }
  if (Math.abs(n) >= 1_000_000) {
    return `${strip(n / 1_000_000)}M`;
  }
  if (Math.abs(n) >= 1_000) {
    return `${strip(n / 1_000)}K`;
  }
  return n.toString();
}

/**
 * Currency formatter factory. Returns a tick format function.
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
    if (isNaN(n)) {
      return String(value);
    }
    if (Math.abs(n) >= 1_000_000_000) {
      return `${symbol}${strip(n / 1_000_000_000)}B`;
    }
    if (Math.abs(n) >= 1_000_000) {
      return `${symbol}${strip(n / 1_000_000)}M`;
    }
    if (Math.abs(n) >= 1_000) {
      return `${symbol}${strip(n / 1_000)}K`;
    }
    return `${symbol}${n.toLocaleString()}`;
  };
}

/** Remove trailing .0 from fixed-point strings */
function strip(n: number): string {
  const s = n.toFixed(1);
  return s.endsWith('.0') ? s.slice(0, -2) : s;
}

/**
 * Percent formatter (e.g. 0.45 → "45%", 1.2 → "120%")
 */
export function percent(value: unknown): string {
  const n = Number(value);
  if (isNaN(n)) {
    return String(value);
  }
  return `${Math.round(n * 100)}%`;
}

/**
 * Date formatter — short date (e.g. "Jan 5", "Mar 12")
 */
export function shortDate(value: unknown): string {
  const d = value instanceof Date ? value : new Date(Number(value));
  if (isNaN(d.getTime())) {
    return String(value);
  }
  return d.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}

/**
 * Date formatter — month/year (e.g. "Jan 2024", "Mar 2025")
 */
export function monthYear(value: unknown): string {
  const d = value instanceof Date ? value : new Date(Number(value));
  if (isNaN(d.getTime())) {
    return String(value);
  }
  return d.toLocaleDateString(undefined, {month: 'short', year: 'numeric'});
}
