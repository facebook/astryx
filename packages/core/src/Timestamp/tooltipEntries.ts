// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tooltipEntries.ts
 * @input A Date and the consumer's tooltip entry list
 * @output Pure formatting of one tooltip line per entry, plus the entry types
 * @position Leaf module; Timestamp renders what this returns and owns no
 *   zone/format logic of its own
 *
 * Kept out of Timestamp.tsx deliberately: the existing `formatTimestamp()`
 * switch builds `system_*` output from local `Date` getters and must stay
 * reachable, unchanged, on every path an existing render can take. The
 * zone-aware `system_*` branch here is entered only when a consumer names an
 * explicit zone, so today's rendering cannot regress.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Timestamp/Timestamp.tsx
 * - /packages/core/src/Timestamp/tooltipEntries.test.ts
 * - /packages/core/src/Timestamp/Timestamp.doc.mjs
 * - /packages/core/src/Timestamp/index.ts
 */

import type {TimestampFormat} from './Timestamp';

// =============================================================================
// Types
// =============================================================================

/**
 * Formats available to a tooltip line.
 *
 * Every `TimestampFormat` that names a fixed instant, plus `'full'` — the long
 * absolute style the tooltip has always shown ("February 19, 2026 at 5:00:00 PM
 * UTC"). `'relative'` and `'auto'` are excluded: a relative phrase ignores any
 * zone, which would make `timezoneID` silently inert on that line.
 *
 * `'full'` lives only in this vocabulary, never in `TimestampFormat` — nothing
 * asked for it as a visible display format, and keeping it out means new
 * members added to `TimestampFormat` become valid tooltip formats for free.
 */
export type TimestampTooltipFormat =
  Exclude<TimestampFormat, 'relative' | 'auto'> | 'full';

/** One line of the Timestamp tooltip. */
export interface TimestampTooltipEntry {
  /**
   * IANA time zone identifier, e.g. `'UTC'`, `'America/Los_Angeles'`.
   * Omit it — or pass `'local'` — for the viewer's own zone.
   *
   * Prefer region identifiers. Fixed-offset abbreviations such as `'EST'` are
   * accepted by the platform but never observe daylight saving, so they read
   * an hour wrong for half the year — `'America/New_York'` is what people
   * usually mean by "Eastern".
   *
   * An identifier the platform does not recognize falls back to the viewer's
   * zone with a console warning rather than throwing.
   */
  timezoneID?: string;
  /**
   * How this line renders the instant.
   * @default 'full'
   */
  format?: TimestampTooltipFormat;
  /**
   * Text shown beside the time, e.g. `'Local'`, `'UTC'`, `'Pacific'`.
   * Supplied already translated; Timestamp never invents or localizes labels.
   */
  label?: string;
}

/** A rendered tooltip line. */
export interface TimestampTooltipLine {
  label?: string;
  value: string;
}

// =============================================================================
// Zone resolution
// =============================================================================

/** Spelling that means "the viewer's own zone" without naming it. */
const LOCAL_ZONE_ALIAS = 'local';

/**
 * Zone identifiers already reported as unknown.
 *
 * Resolution runs once per entry on every render, so without this a single
 * typo on a live timestamp would emit the same warning every tick, forever.
 * One report per bad identifier is enough to act on.
 */
const warnedTimezoneIDs = new Set<string>();

/**
 * Resolves an entry's zone to something safe to hand to `Intl`.
 *
 * Returns `undefined` for the viewer's own zone, which is also what `Intl`
 * treats as "use the host zone" — so the local path never constructs a
 * formatter with an explicit `timeZone` and cannot drift from today's output.
 */
function resolveTimezoneID(timezoneID: string | undefined): string | undefined {
  if (
    timezoneID === undefined ||
    timezoneID.toLowerCase() === LOCAL_ZONE_ALIAS
  ) {
    return undefined;
  }

  // An unrecognized identifier makes every Intl.DateTimeFormat constructor
  // throw a RangeError. Rendering a timestamp must never take down the tree —
  // degrade to the viewer's zone and say so, mirroring how an unparseable
  // `value` is handled in Timestamp.tsx.
  try {
    new Intl.DateTimeFormat(undefined, {timeZone: timezoneID});
  } catch {
    if (!warnedTimezoneIDs.has(timezoneID)) {
      warnedTimezoneIDs.add(timezoneID);
      console.warn(
        `Timestamp: unknown time zone ${JSON.stringify(timezoneID)} in tooltipEntries. Falling back to the viewer's time zone.`,
      );
    }
    return undefined;
  }

  return timezoneID;
}

/**
 * A stable key for "which zone did the consumer ask for", used to decide
 * whether the tooltip needs zone abbreviations to disambiguate its lines.
 *
 * Deliberately keyed on the *requested* zone, not on the resolved offset: a
 * consumer who asks for two zones gets both labelled even when the viewer
 * happens to be sitting in one of them, so the rendering does not change shape
 * depending on where the reader is. That also keeps this testable under any
 * machine timezone.
 */
function zoneKey(resolved: string | undefined): string {
  return resolved === undefined ? LOCAL_ZONE_ALIAS : resolved.toLowerCase();
}

// =============================================================================
// Formatting
// =============================================================================

/** The long absolute style the tooltip has shown since it existed. */
const FULL_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  timeZoneName: 'short',
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/**
 * Wall-clock fields for an instant in a given zone.
 *
 * Same technique as `getTimeZoneParts` in utils/plainDate.ts — a fixed
 * `'en-US'` locale and `hourCycle: 'h23'` so the numeric parts are stable
 * regardless of the viewer's locale, then read back off `formatToParts`.
 */
function getWallClock(date: Date, timezoneID: string): WallClock {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezoneID,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const lookup: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      lookup[part.type] = Number(part.value);
    }
  }

  return {
    year: lookup.year,
    month: lookup.month,
    day: lookup.day,
    hour: lookup.hour,
    minute: lookup.minute,
    second: lookup.second,
  };
}

/** Wall-clock fields in the viewer's own zone, straight off the Date. */
function getLocalWallClock(date: Date): WallClock {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
  };
}

/**
 * Whether a format should carry a zone abbreviation.
 *
 * `'full'` always has one (that is the style). `system_*` never does — those
 * are machine shapes and a trailing "PST" would break anything parsing them,
 * which is also why `isTimezoneShown` has never applied to them.
 *
 * The two human formats that can carry one do so when either the reader has
 * to tell several lines apart, or the line shows a zone the consumer named
 * explicitly. That second case matters even for a lone entry: the tooltip is
 * the `<time>` element's `aria-describedby`, and that element's accessible
 * name is the absolute time in the *viewer's* zone — so an unmarked foreign
 * time is announced directly after a local one with nothing to distinguish
 * them. A line the consumer did not steer stays unmarked, matching how the
 * visible text reads with `isTimezoneShown` off.
 */
function shouldShowZoneName(
  format: TimestampTooltipFormat,
  hasMultipleZones: boolean,
  isNamedZone: boolean,
): boolean {
  if (format === 'full') {
    return true;
  }
  if (format === 'date_time' || format === 'time') {
    return hasMultipleZones || isNamedZone;
  }
  return false;
}

function formatLine(
  date: Date,
  format: TimestampTooltipFormat,
  timezoneID: string | undefined,
  hasMultipleZones: boolean,
): string {
  const showZoneName = shouldShowZoneName(
    format,
    hasMultipleZones,
    timezoneID !== undefined,
  );
  const zone = timezoneID === undefined ? {} : {timeZone: timezoneID};

  switch (format) {
    case 'full':
      return new Intl.DateTimeFormat(undefined, {
        ...FULL_OPTIONS,
        ...zone,
      }).format(date);

    case 'date':
      return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...zone,
      }).format(date);

    case 'date_time':
      return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        ...(showZoneName ? {timeZoneName: 'short' as const} : {}),
        ...zone,
      }).format(date);

    case 'time':
      return new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        ...(showZoneName ? {timeZoneName: 'short' as const} : {}),
        ...zone,
      }).format(date);

    case 'system_date': {
      const w =
        timezoneID === undefined
          ? getLocalWallClock(date)
          : getWallClock(date, timezoneID);
      return `${w.year}-${pad(w.month)}-${pad(w.day)}`;
    }

    case 'system_date_time': {
      const w =
        timezoneID === undefined
          ? getLocalWallClock(date)
          : getWallClock(date, timezoneID);
      return `${w.year}-${pad(w.month)}-${pad(w.day)} ${pad(w.hour)}:${pad(w.minute)}:${pad(w.second)}`;
    }

    case 'system_time': {
      const w =
        timezoneID === undefined
          ? getLocalWallClock(date)
          : getWallClock(date, timezoneID);
      return `${pad(w.hour)}:${pad(w.minute)}:${pad(w.second)}`;
    }
  }
}

/**
 * Renders one tooltip line per entry, in the order given.
 *
 * Pure: the same `date` and `entries` always produce the same lines for a given
 * host zone and locale.
 */
export function formatTooltipLines(
  date: Date,
  entries: ReadonlyArray<TimestampTooltipEntry>,
): ReadonlyArray<TimestampTooltipLine> {
  const resolved = entries.map(entry => resolveTimezoneID(entry.timezoneID));
  const hasMultipleZones = new Set(resolved.map(zoneKey)).size > 1;

  return entries.map((entry, index) => ({
    ...(entry.label === undefined ? {} : {label: entry.label}),
    value: formatLine(
      date,
      entry.format ?? 'full',
      resolved[index],
      hasMultipleZones,
    ),
  }));
}
