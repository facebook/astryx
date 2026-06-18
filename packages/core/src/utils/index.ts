// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Utils module exports
 * @output Re-exports all utility functions and shared types
 * @position Package entry point for utils
 */

export type {SizeValue} from './types';

export type {ISODateString, DayOfWeek, PlainDate, DateRange} from './dateTypes';

export {
  parseDateInput,
  dateToISO,
  parseISO,
  isLocaleDayFirst,
} from './dateParser';

export {
  plainDateCreate,
  plainDateFromISO,
  plainDateToISO,
  plainDateToDate,
  plainDateFromDate,
  plainDateToday,
  getDaysInMonth,
  plainDateDayOfWeek,
  plainDateAddMonths,
  plainDateAddDays,
  plainDateToInstant,
  plainDateFromInstant,
  plainDateIsBefore,
  plainDateIsAfter,
  plainDateIsEqual,
  plainDateMax,
  plainDateMin,
  plainDateIsInRange,
  plainDateSetFirstOfMonth,
  plainDateSetStartOfWeek,
  plainDateSetEndOfWeekExclusive,
  plainDateGetWeekNumber,
  plainDateFormat,
  DATE_FORMAT_WITH_WEEKDAY,
  DATE_FORMAT_LONG,
  DATE_FORMAT_MONTH_YEAR,
  DATE_FORMAT_SHORT,
  DATE_FORMAT_SHORT_WITH_YEAR,
} from './plainDate';

export {
  parseISOTime,
  formatISOTime,
  formatDisplayTime12h,
  formatDisplayTime24h,
  parseTimeInput,
  compareTime,
  isTimeInRange,
  clampTime,
  adjustTime,
  createISOTimeString,
} from './timeParser';
export type {ISOTimeString, ParsedTime} from './timeParser';

export {parseStyleKey} from './parseStyleKey';
export {getKey, type XDSKey, type XDSKeyFallback} from './getKey';

export {mergeProps} from './mergeProps';
export {mergeRefs} from './mergeRefs';
export {groupItems, getItemGroup} from './groupItems';
export type {ItemGroup} from './groupItems';
export {observeResize, unobserveResize} from './sharedResizeObserver';
export {isRenderable} from './isRenderable';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export type {
  XDSKey as Key,
  XDSKeyFallback as KeyFallback,
} from '.';
// <compat-aliases:end>
