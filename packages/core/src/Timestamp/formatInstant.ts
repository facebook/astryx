// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file formatInstant.ts
 * @input A Date, one absolute format name, and an optional time zone
 * @output That instant rendered as a string
 * @position Leaf shared by Timestamp's visible text and each of its tooltip
 *   lines; owns every absolute format Timestamp can produce
 *
 * Timestamp renders the same instant on two surfaces — the visible text and,
 * on hover, one line per configured time zone. They differ only in which zone
 * they name and whether they carry a zone abbreviation, so they are one
 * formatter parameterized by zone rather than two switches that have to be
 * kept in step by hand. Adding a member to `TimestampFormat` now fails to
 * compile in exactly one place.
 *
 * Each caller keeps its own policy for the zone abbreviation: the visible text
 * takes it straight from the `isTimezoneShown` prop, a tooltip line derives it
 * from how many zones are on screen (see tooltipEntries.ts). Only the
 * rendering is shared, not the decision.
 *
 * Omitting `timeZone` means the viewer's own zone. That path hands `Intl` no
 * `timeZone` and keeps `system_*` on plain `Date` getters, so it produces
 * exactly what it produced before this module existed.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Timestamp/Timestamp.tsx
 * - /packages/core/src/Timestamp/tooltipEntries.ts
 * - /packages/core/src/Timestamp/Timestamp.test.tsx
 */

import {SHARED_DATE_FORMAT_OPTIONS, getTimeZoneParts} from '../utils/plainDate';
import type {TimestampFormat} from './Timestamp';

// =============================================================================
// Types
// =============================================================================

/**
 * Every format that names a fixed instant, plus `'full'` — the long absolute
 * style ("February 19, 2026 at 5:00:00 PM UTC") that backs a relative
 * timestamp's accessible name and the tooltip's default line.
 *
 * `'relative'` and `'auto'` are excluded: a relative phrase names no instant,
 * so a zone could not change what it says.
 */
export type InstantFormat =
  | Exclude<TimestampFormat, 'relative' | 'auto'>
  | 'full';

export interface FormatInstantOptions {
  /**
   * IANA time zone identifier. Omit for the viewer's own zone — which is what
   * `Intl` already does with no `timeZone`, so the omitted path never
   * constructs an explicit-zone formatter and cannot drift from the host
   * default.
   *
   * Must already be one the platform accepts. An identifier `Intl` does not
   * recognize throws a `RangeError` from its constructor, before any
   * formatting happens; deciding what to do about that belongs to whoever
   * took the identifier from a consumer, not here (tooltipEntries resolves
   * and warns in `resolveTimezoneID`, then passes only what survived).
   */
  timeZone?: string;
  /**
   * Whether to append the zone abbreviation. Honoured by `date_time` and
   * `time` only: `'full'` always carries one because that is the style, and
   * the `system_*` shapes never do — a trailing "PST" would break anything
   * parsing them, which is why `isTimezoneShown` has never applied to them.
   * @default false
   */
  isTimezoneShown?: boolean;
}

// =============================================================================
// Option bags
// =============================================================================

/** The long absolute style, with seconds and a zone name. */
const FULL_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  timeZoneName: 'short',
};

/** The time-of-day part, shared by `time` and `date_time`. */
const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
};

/**
 * The date part here is spelled out rather than taken from
 * `SHARED_DATE_FORMAT_OPTIONS.date`. That bag is shared with DateInput, and
 * pointing `date_time` at it would mean a change made for date-only fields
 * silently reshaped every date-and-time reading too. The two agree today; they
 * are not the same decision.
 */
const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  ...TIME_OPTIONS,
};

// =============================================================================
// Formatting
// =============================================================================

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** The fields a `system_*` string is assembled from. */
interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/**
 * Wall-clock fields for an instant: in the named zone, or — with no zone —
 * the viewer's own, read straight off the `Date`. The zone-less branch
 * deliberately stays on plain getters so the default rendering never gains a
 * dependency on `Intl` zone data it did not have before.
 *
 * The explicit return type is load-bearing: it is what forces the two branches
 * to keep producing the same shape.
 */
function getWallClock(date: Date, timeZone: string | undefined): WallClock {
  return timeZone === undefined
    ? {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
      }
    : getTimeZoneParts(date.getTime(), timeZone);
}

/**
 * Renders one instant in one absolute format.
 *
 * Pure: the same arguments always produce the same string for a given host
 * locale (and, when no `timeZone` is given, host zone).
 */
export function formatInstant(
  date: Date,
  format: InstantFormat,
  {timeZone, isTimezoneShown = false}: FormatInstantOptions = {},
): string {
  const zone = timeZone === undefined ? {} : {timeZone};
  const zoneName = isTimezoneShown ? {timeZoneName: 'short' as const} : {};

  switch (format) {
    case 'full':
      return new Intl.DateTimeFormat(undefined, {
        ...FULL_OPTIONS,
        ...zone,
      }).format(date);

    case 'date':
      return new Intl.DateTimeFormat(undefined, {
        ...SHARED_DATE_FORMAT_OPTIONS.date,
        ...zone,
      }).format(date);

    case 'date_long':
      return new Intl.DateTimeFormat(undefined, {
        ...SHARED_DATE_FORMAT_OPTIONS.date_long,
        ...zone,
      }).format(date);

    case 'date_weekday':
      return new Intl.DateTimeFormat(undefined, {
        ...SHARED_DATE_FORMAT_OPTIONS.date_weekday,
        ...zone,
      }).format(date);

    case 'date_time':
      return new Intl.DateTimeFormat(undefined, {
        ...DATE_TIME_OPTIONS,
        ...zoneName,
        ...zone,
      }).format(date);

    case 'time':
      return new Intl.DateTimeFormat(undefined, {
        ...TIME_OPTIONS,
        ...zoneName,
        ...zone,
      }).format(date);

    case 'system_date': {
      const w = getWallClock(date, timeZone);
      return `${w.year}-${pad(w.month)}-${pad(w.day)}`;
    }

    case 'system_date_time': {
      const w = getWallClock(date, timeZone);
      return `${w.year}-${pad(w.month)}-${pad(w.day)} ${pad(w.hour)}:${pad(w.minute)}:${pad(w.second)}`;
    }

    case 'system_time': {
      const w = getWallClock(date, timeZone);
      return `${pad(w.hour)}:${pad(w.minute)}:${pad(w.second)}`;
    }
  }
}
