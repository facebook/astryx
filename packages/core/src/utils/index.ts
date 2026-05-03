/**
 * @file index.ts
 * @input Utils module exports
 * @output Re-exports all utility functions and shared types
 * @position Package entry point for utils
 */

export type {SizeValue} from './types';

export {
  parseDateInput,
  formatDisplayDate,
  dateToISO,
  parseISO,
  isLocaleDayFirst,
} from './dateParser';

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

export {xdsClassName} from './xdsClassName';

export {mergeProps} from './mergeProps';
export {groupItems, getItemGroup} from './groupItems';
export type {ItemGroup} from './groupItems';
export {observeResize, unobserveResize} from './sharedResizeObserver';
