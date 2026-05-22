// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSTimestamp.tsx
 * @input Uses React, Intl.DateTimeFormat, XDSText
 * @output Exports XDSTimestamp component and related types
 * @position Core implementation; renders formatted timestamps
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Timestamp/Timestamp.doc.mjs
 * - /packages/core/src/Timestamp/XDSTimestamp.test.tsx
 * - /packages/core/src/Timestamp/index.ts
 * - /apps/storybook/stories/Timestamp.stories.tsx
 * - /packages/cli/templates/blocks/components/Timestamp/ (showcase blocks)
 */

import {useEffect, useRef, useState, lazy, Suspense} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSText} from '../Text';
import type {
  XDSTextType,
  XDSTextSize,
  XDSTextColor,
  XDSTextWeight,
} from '../theme/types';
import {xdsClassName, mergeRefs} from '../utils';
import type {XDSBaseProps} from '../XDSBaseProps';

const LazyXDSTooltip = lazy(() =>
  import('../Tooltip/XDSTooltip').then(mod => ({default: mod.XDSTooltip})),
);

// =============================================================================
// Types
// =============================================================================

export type XDSTimestampFormat =
  | 'relative'
  | 'auto'
  | 'date'
  | 'date_time'
  | 'time'
  | 'system_date'
  | 'system_date_time'
  | 'system_time';

export interface XDSTimestampProps extends XDSBaseProps<HTMLTimeElement> {
  /** Ref forwarded to the root `<time>` element. */
  ref?: React.Ref<HTMLTimeElement>;
  /** The date/time to display. Accepts Unix timestamps (seconds) or ISO 8601 strings. */
  value: string | number;
  /**
   * Display format.
   * - `'relative'`: "2 hours ago", "yesterday", "just now"
   * - `'auto'`: Relative for recent times, `date_time` for older
   * - `'date'`: "Mar 21, 2025"
   * - `'date_time'`: "Mar 21, 2025, 2:51 PM"
   * - `'time'`: "2:51 PM"
   * - `'system_date'`: "2025-03-21"
   * - `'system_date_time'`: "2025-03-21 14:51:53"
   * - `'system_time'`: "14:51:53"
   * @default 'auto'
   */
  format?: XDSTimestampFormat;
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
  type?: XDSTextType;
  /**
   * Explicit font size override. Overrides the size from `type`.
   */
  size?: XDSTextSize;
  /**
   * Text color.
   * @default 'secondary'
   */
  color?: XDSTextColor;
  /**
   * Font weight override.
   */
  weight?: XDSTextWeight;
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

  if (diffSeconds < 0) {
    // Future dates
    const absDiff = Math.abs(diffSeconds);
    if (absDiff < MINUTE) {
      return 'in a few seconds';
    }
    if (absDiff < HOUR) {
      const mins = Math.round(absDiff / MINUTE);
      return `in ${mins} ${mins === 1 ? 'minute' : 'minutes'}`;
    }
    if (absDiff < DAY) {
      const hours = Math.round(absDiff / HOUR);
      return `in ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    if (absDiff < MONTH) {
      const days = Math.round(absDiff / DAY);
      return `in ${days} ${days === 1 ? 'day' : 'days'}`;
    }
    if (absDiff < YEAR) {
      const months = Math.round(absDiff / MONTH);
      return `in ${months} ${months === 1 ? 'month' : 'months'}`;
    }
    const years = Math.round(absDiff / YEAR);
    return `in ${years} ${years === 1 ? 'year' : 'years'}`;
  }

  if (diffSeconds < 10) {
    return 'just now';
  }
  if (diffSeconds < MINUTE) {
    return `${diffSeconds} seconds ago`;
  }
  if (diffSeconds < HOUR) {
    const mins = Math.round(diffSeconds / MINUTE);
    return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diffSeconds < DAY) {
    const hours = Math.round(diffSeconds / HOUR);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diffSeconds < 2 * DAY) {
    return 'yesterday';
  }
  if (diffSeconds < MONTH) {
    const days = Math.round(diffSeconds / DAY);
    return `${days} days ago`;
  }
  if (diffSeconds < YEAR) {
    const months = Math.round(diffSeconds / MONTH);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  const years = Math.round(diffSeconds / YEAR);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatTimestamp(
  date: Date,
  format: Exclude<XDSTimestampFormat, 'relative' | 'auto'>,
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
  format: XDSTimestampFormat,
): format is Exclude<XDSTimestampFormat, 'relative' | 'auto'> {
  return format !== 'relative' && format !== 'auto';
}

// =============================================================================
// Component
// =============================================================================

/**
 * Displays a formatted timestamp as human-readable text.
 *
 * Renders a semantic `<time>` element with an ISO 8601 `datetime` attribute,
 * styled via XDSText. Supports relative ("2 hours ago"), multiple absolute
 * formats, and auto formatting. Optionally shows a tooltip with the full
 * absolute time and can update live.
 *
 * @example
 * ```
 * <XDSTimestamp value="2026-02-19T17:00:00Z" />
 * <XDSTimestamp value={1740000000} format="date" />
 * <XDSTimestamp value={date} format="auto" isLive />
 * <XDSTimestamp value={event.timestamp} format="system_date_time" />
 * ```
 */
export function XDSTimestamp({
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
}: XDSTimestampProps) {
  const timeRef = useRef<HTMLTimeElement>(null);
  const [now, setNow] = useState(() => new Date());

  const date = parseValue(value);
  const isoString = date.toISOString();

  // Determine effective format
  const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const effectiveFormat: XDSTimestampFormat =
    format === 'auto'
      ? Math.abs(diffSeconds) <= autoThreshold
        ? 'relative'
        : 'date_time'
      : format;

  // Format the display text
  const displayText =
    effectiveFormat === 'relative'
      ? getRelativeTimeString(date, now)
      : isAbsoluteFormat(effectiveFormat)
        ? formatTimestamp(date, effectiveFormat, isTimezoneShown)
        : '';

  // Full absolute text for tooltip and aria-label
  const fullAbsoluteText = getFullAbsoluteString(date);

  // Live updates
  useEffect(() => {
    if (!isLive || effectiveFormat !== 'relative') {
      return;
    }

    const interval = getLiveInterval(diffSeconds);
    const timer = setInterval(() => {
      setNow(new Date());
    }, interval);

    return () => clearInterval(timer);
  }, [isLive, effectiveFormat, diffSeconds]);

  const showTooltip = hasTooltip && effectiveFormat === 'relative';

  const timestampClass = xdsClassName('timestamp', {format: effectiveFormat});

  const timeElement = (
    <XDSText
      type={type}
      size={size}
      color={color}
      weight={weight}
      xstyle={xstyle}
      className={[timestampClass, className].filter(Boolean).join(' ')}
      style={style}>
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
    </XDSText>
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

XDSTimestamp.displayName = 'XDSTimestamp';
