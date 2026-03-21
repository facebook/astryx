/**
 * @file index.ts
 * @input Imports calendar components and types
 * @output Exports XDSCalendar and related types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Calendar/Calendar.doc.mjs
 */

export {XDSCalendar} from './XDSCalendar';
export type {
  XDSCalendarProps,
  XDSCalendarHandle,
  ISODateString,
  DayOfWeek,
  DateRange,
} from './XDSCalendar';
