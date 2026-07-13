// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Timestamp.tsx
 * @input Uses React, Intl.DateTimeFormat, Text
 * @output Exports Timestamp component and related types
 * @position Core implementation; renders formatted timestamps
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Timestamp/Timestamp.doc.mjs
 * - /packages/core/src/Timestamp/Timestamp.test.tsx
 * - /packages/core/src/Timestamp/index.ts
 * - /apps/storybook/stories/Timestamp.stories.tsx
 * - /packages/cli/templates/blocks/components/Timestamp/ (showcase blocks)
 */

import {useEffect, useRef, useState, lazy, Suspense} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Text} from '../Text';
import type {TextType, TextSize, TextColor, TextWeight} from '../theme/types';
import {mergeProps, mergeRefs} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';

const LazyXDSTooltip = lazy(async () =>
  import('../Tooltip/Tooltip').then(mod => ({default: mod.Tooltip})),
);

// =============================================================================
// Types
// =============================================================================

export type TimestampFormat =
  | 'relative'
  | 'auto'
  | 'date'
  | 'date_time'
  | 'time'
  | 'system_date'
  | 'system_date_time'
  | 'system_time';

export interface TimestampProps extends BaseProps<HTMLTimeElement> {
  /** Ref forwarded to the root `<time>` element. */
  ref?: React.Ref<HTMLTimeElement>;
  /** The date/time to display. Accepts Unix timestamps (seconds) or ISO 8601 strings. */
  value: string | number;
  /**
   * Display format.
   * - `'relative'`: "2 hours ago", "yesterday", "now"
   * - `'auto'`: Relative for recent times, `date_time` for older
   * - `'date'`: "Mar 21, 2025"
   * - `'date_time'`: "Mar 21, 2025, 2:51 PM"
   * - `'time'`: "2:51 PM"
   * - `'system_date'`: "2025-03-21"
   * - `'system_date_time'`: "2025-03-21 14:51:53"
   * - `'system_time'`: "14:51:53"
   * @default 'auto'
   */
  format?: TimestampFormat;
  /**
   * Threshold in seconds for 'auto' format to switch from relative to date_time.
   * @default 604800 (7 days)
   */
  autoThreshold?: number;
  /**
   * Whether to show a tooltip with the full date/time on hover.
   * @default true
   */
  hasTooltip?: boolean;
  /**
   * Whether to append the timezone abbreviation after the timestamp.
   * Applies to date_time, time, system_date_time, and system_time formats.
   * @default false
   */
  isTimezoneShown?: boolean;
  /**
   * Whether the relative time should update live.
   * @default false
   */
  isLive?: boolean;
  /**
   * Semantic text type. Determines size, weight, and line-height from theme.
   * @default 'supporting'
   */
  type?: TextType;
  /**
   * Explicit font size override. Overrides the size from `type`.
   */
  size?: TextSize;
  /**
   * Text color.
   * @default 'secondary'
   */
  color?: TextColor;
  /**
   * Font weight override.
   */
  weight?: TextWeight;
  /** Test ID for testing frameworks. */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  time: {
    display: 'inline',
    fontFamily: 'inherit',
    fontStyle: 'normal',
    // Reset <time> element defaults
    fontSize: 'inherit',
    lineHeight: 'inherit',
    color: 'inherit',
    fontWeight: 'inherit',
  },
});

// =============================================================================
// Formatting utilities
// =============================================================================

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/** Default auto threshold: 7 days in seconds */
const DEFAULT_AUTO_THRESHOLD = 7 * DAY;

/**
 * Tolerance (in seconds) for treating a *future* timestamp as the present.
 * A value only a handful of seconds ahead of our reference clock is almost
 * always clock skew — the displayed `now` lagging the real clock, or the value
 * being produced on a slightly faster clock — not a genuine future event, so
 * it reads as "now" rather than a confusing "in a few seconds". The future
 * side gets a wider window than the past (which only needs to absorb the
 * sub-second render-time lag) because future drift is far more likely to be
 * skew than real.
 */
const FUTURE_SKEW_TOLERANCE = 30;

function parseValue(value: string | number): Date {
  if (typeof value === 'number') {
    // Heuristic: if the number is less than 1e12, treat as seconds; otherwise ms.
    // Unix timestamps in seconds are < 1e12 until ~2286.
    return new Date(value < 1e12 ? value * 1000 : value);
  }
  return new Date(value);
}

function getRelativeTimeString(date: Date, now: Date): string {
  const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

  // Treat values at (or a hair before/after) the present as "now". The
  // internal `now` reference is captured at render time, so it can lag the
  // real clock; a value equal to "right now" can land a fraction of a second
  // in the future and round to a small negative delta. Without this clamp,
  // such values fall into the future branch and render "in a few seconds".
  if (Math.abs(diffSeconds) < 10) {
    return 'now';
  }

  if (diffSeconds < 0) {
    // Future dates
    const absDiff = Math.abs(diffSeconds);
    // A value only a few seconds ahead of our clock is almost always skew, not
    // a genuine future event — render it as the present rather than a
    // confusing "in a few seconds". Wider than the past window above on
    // purpose (see FUTURE_SKEW_TOLERANCE).
    if (absDiff <= FUTURE_SKEW_TOLERANCE) {
      return 'now';
    }
    if (absDiff < MINUTE) {
      return 'in a few seconds';
    }
    if (absDiff < HOUR) {
      const mins = Math.floor(absDiff / MINUTE);
      return `in ${mins} ${mins === 1 ? 'minute' : 'minutes'}`;
    }
    if (absDiff < DAY) {
      const hours = Math.floor(absDiff / HOUR);
      return `in ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    if (absDiff < MONTH) {
      const days = Math.floor(absDiff / DAY);
      return `in ${days} ${days === 1 ? 'day' : 'days'}`;
    }
    if (absDiff < YEAR) {
      const months = Math.floor(absDiff / MONTH);
      return `in ${months} ${months === 1 ? 'month' : 'months'}`;
    }
    const years = Math.floor(absDiff / YEAR);
    return `in ${years} ${years === 1 ? 'year' : 'years'}`;
  }

  if (diffSeconds < MINUTE) {
    return `${diffSeconds} seconds ago`;
  }
  if (diffSeconds < HOUR) {
    const mins = Math.floor(diffSeconds / MINUTE);
    return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diffSeconds < DAY) {
    const hours = Math.floor(diffSeconds / HOUR);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diffSeconds < 2 * DAY) {
    return 'yesterday';
  }
  if (diffSeconds < MONTH) {
    const days = Math.floor(diffSeconds / DAY);
    return `${days} days ago`;
  }
  if (diffSeconds < YEAR) {
    const months = Math.floor(diffSeconds / MONTH);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  const years = Math.floor(diffSeconds / YEAR);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatTimestamp(
  date: Date,
  format: Exclude<TimestampFormat, 'relative' | 'auto'>,
  isTimezoneShown: boolean,
): string {
  switch (format) {
    case 'date':
      return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);

    case 'date_time':
      return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        ...(isTimezoneShown ? {timeZoneName: 'short'} : {}),
      }).format(date);

    case 'time':
      return new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        ...(isTimezoneShown ? {timeZoneName: 'short'} : {}),
      }).format(date);

    case 'system_date': {
      const y = date.getFullYear();
      const m = pad(date.getMonth() + 1);
      const d = pad(date.getDate());
      return `${y}-${m}-${d}`;
    }

    case 'system_date_time': {
      const y = date.getFullYear();
      const m = pad(date.getMonth() + 1);
      const d = pad(date.getDate());
      const h = pad(date.getHours());
      const min = pad(date.getMinutes());
      const s = pad(date.getSeconds());
      return `${y}-${m}-${d} ${h}:${min}:${s}`;
    }

    case 'system_time': {
      const h = pad(date.getHours());
      const min = pad(date.getMinutes());
      const s = pad(date.getSeconds());
      return `${h}:${min}:${s}`;
    }
  }
}

function getFullAbsoluteString(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  }).format(date);
}

/** Returns the interval (in ms) at which a relative timestamp should update. */
function getLiveInterval(diffSeconds: number): number {
  const absDiff = Math.abs(diffSeconds);
  if (absDiff < MINUTE) {
    return 1000;
  } // every second
  if (absDiff < HOUR) {
    return 30_000;
  } // every 30s
  if (absDiff < DAY) {
    return 60_000;
  } // every minute
  return 300_000; // every 5 minutes
}

/** Whether a format is non-relative (i.e. shows a fixed date/time). */
function isAbsoluteFormat(
  format: TimestampFormat,
): format is Exclude<TimestampFormat, 'relative' | 'auto'> {
  return format !== 'relative' && format !== 'auto';
}

// =============================================================================
// Component
// =============================================================================

/**
 * Displays a formatted timestamp as human-readable text.
 *
 * Renders a semantic `<time>` element with an ISO 8601 `datetime` attribute,
 * styled via Text. Supports relative ("2 hours ago"), multiple absolute
 * formats, and auto formatting. Optionally shows a tooltip with the full
 * absolute time and can update live.
 *
 * @example
 * ```
 * <Timestamp value="2026-02-19T17:00:00Z" />
 * <Timestamp value={1740000000} format="date" />
 * <Timestamp value={date} format="auto" isLive />
 * <Timestamp value={event.timestamp} format="system_date_time" />
 * ```
 */
export function Timestamp({
  value,
  format = 'auto',
  autoThreshold = DEFAULT_AUTO_THRESHOLD,
  hasTooltip = true,
  isTimezoneShown = false,
  isLive = false,
  type = 'supporting',
  size,
  color = 'secondary',
  weight,
  xstyle,
  className,
  style,
  ref,
  'data-testid': testId,
}: TimestampProps) {
  const timeRef = useRef<HTMLTimeElement>(null);
  const [now, setNow] = useState(() => new Date());

  const date = parseValue(value);
  // An unparseable value (a malformed date string, or a NaN timestamp from
  // missing data) yields an Invalid Date, and formatting one throws "Invalid
  // time value" — crashing the whole tree. Compute nothing from it here and
  // bail out below (after the hooks) instead.
  const isValidDate = !Number.isNaN(date.getTime());
  const isoString = isValidDate ? date.toISOString() : '';

  // Determine effective format
  const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const effectiveFormat: TimestampFormat =
    format === 'auto'
      ? Math.abs(diffSeconds) <= autoThreshold
        ? 'relative'
        : 'date_time'
      : format;

  // Format the display text
  const displayText = !isValidDate
    ? ''
    : effectiveFormat === 'relative'
      ? getRelativeTimeString(date, now)
      : isAbsoluteFormat(effectiveFormat)
        ? formatTimestamp(date, effectiveFormat, isTimezoneShown)
        : '';

  // Full absolute text for tooltip and aria-label
  const fullAbsoluteText = isValidDate ? getFullAbsoluteString(date) : '';

  // Live updates
  useEffect(() => {
    if (!isLive || !isValidDate || effectiveFormat !== 'relative') {
      return;
    }

    const interval = getLiveInterval(diffSeconds);
    const timer = setInterval(() => {
      setNow(new Date());
    }, interval);

    return () => clearInterval(timer);
  }, [isLive, isValidDate, effectiveFormat, diffSeconds]);

  // Placed after all hooks so the hook order stays stable across renders.
  if (!isValidDate) {
    console.warn(
      `Timestamp: could not parse value ${JSON.stringify(value)} as a date. Rendering nothing.`,
    );
    return null;
  }

  const showTooltip = hasTooltip && effectiveFormat === 'relative';

  const timestampProps = mergeProps(
    themeProps('timestamp', {format: effectiveFormat}),
    {className, style},
  );

  const timeElement = (
    <Text
      type={type}
      size={size}
      color={color}
      weight={weight}
      xstyle={xstyle}
      {...timestampProps}>
      <time
        ref={mergeRefs(ref, timeRef)}
        dateTime={isoString}
        aria-label={
          effectiveFormat === 'relative' ? fullAbsoluteText : undefined
        }
        data-testid={testId}
        {...stylex.props(styles.time)}>
        {displayText}
      </time>
    </Text>
  );

  if (showTooltip) {
    return (
      <>
        {timeElement}
        <Suspense fallback={null}>
          <LazyXDSTooltip
            anchorRef={timeRef}
            content={fullAbsoluteText}
            placement="above"
          />
        </Suspense>
      </>
    );
  }

  return timeElement;
}

Timestamp.displayName = 'Timestamp';
