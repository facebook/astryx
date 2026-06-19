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
export {getKey, type Key, type KeyFallback} from './getKey';

export {mergeProps} from './mergeProps';
export {mergeRefs} from './mergeRefs';
export {groupItems, getItemGroup} from './groupItems';
export type {ItemGroup} from './groupItems';
export {observeResize, unobserveResize} from './sharedResizeObserver';
export {isRenderable} from './isRenderable';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  DATE_FORMAT_LONG as XDSDATE_FORMAT_LONG,
  DATE_FORMAT_MONTH_YEAR as XDSDATE_FORMAT_MONTH_YEAR,
  DATE_FORMAT_SHORT as XDSDATE_FORMAT_SHORT,
  DATE_FORMAT_SHORT_WITH_YEAR as XDSDATE_FORMAT_SHORT_WITH_YEAR,
  DATE_FORMAT_WITH_WEEKDAY as XDSDATE_FORMAT_WITH_WEEKDAY,
} from '.';
export type {
  DateRange as XDSDateRange,
  DayOfWeek as XDSDayOfWeek,
  ISODateString as XDSISODateString,
  ISOTimeString as XDSISOTimeString,
  ItemGroup as XDSItemGroup,
  Key as XDSKey,
  KeyFallback as XDSKeyFallback,
  ParsedTime as XDSParsedTime,
  PlainDate as XDSPlainDate,
  SizeValue as XDSSizeValue,
} from '.';
// <compat-aliases:end>
