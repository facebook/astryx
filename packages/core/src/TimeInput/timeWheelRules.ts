// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file timeWheelRules.ts
 * @input A time of day, the hour format, the minute interval and the bounds
 * @output Pure rules of UIDatePicker's time wheels: the minute interval, the
 *   columns' rows, the time a turned column makes, and which other columns
 *   must turn with it
 * @position Internal helper of the TimeInput and DateTimeInput touch sheets;
 *   consumed by TimeWheels.tsx, tested by timeWheelRules.test.ts
 *
 * The rules follow UIDatePicker's `.time` wheels (motion/uikit/datePicker.ts
 * `wheels`):
 *
 * - The minute column shows every n-th minute for a `minuteInterval` that
 *   divides 60, from 1 to 30; any other interval is 1. A time off the
 *   interval shows rounded to it, as `roundsToMinuteInterval` rounds the
 *   picker's date.
 * - In 12-hour time the hour column (1 … 12, looping) moves the time by the
 *   hours it turned: a turn from 11 to 12 is a turn from AM to PM, and the
 *   AM/PM column follows (`meridiemFollowsHour`). A Wheel reports only the row
 *   it rests on, so the turn is read as the shorter way round (at most six
 *   rows); UIKit's column keeps count over a longer fling, which can pass 12
 *   twice.
 * - Minutes do not carry into the hour (`minutesCarry`).
 * - A time past the bounds is brought back onto the nearest bound
 *   (`restPastBound`), and every column whose row changes turns onto it.
 *
 * Pure functions on purpose: this is the part of the wheels most likely to be
 * wrong, and it is testable without a layout engine.
 *
 * SYNC: When modified, update timeWheelRules.test.ts and TimeWheels.tsx.
 */

import {datePicker} from '../motion/uikit/datePicker';

/** A time of day, 24-hour. */
export interface TimeParts {
  hour: number;
  minute: number;
  second: number;
}

/** A time wheel column. */
export type TimeColumn = 'hour' | 'minute' | 'second' | 'meridiem';

/** One row of a column: the value it stands for and its label. */
export interface TimeRow {
  value: number;
  label: string;
  isDisabled: boolean;
}

/** Inclusive bounds in seconds since midnight; `null` is unbounded. */
export interface TimeBounds {
  min: number | null;
  max: number | null;
}

const SECONDS_PER_DAY = 24 * 3600;

/**
 * The minute interval the minute column steps by: `increment` when it is a
 * whole number of minutes that divides 60 and is at most
 * `datePicker.wheels.minuteIntervalMax` (30), otherwise 1 (UIDatePicker's
 * `minuteInterval` rule).
 *
 * @example
 * ```
 * minuteIntervalOf(15); // 15
 * minuteIntervalOf(7); // 1: does not divide 60
 * minuteIntervalOf(60); // 1: over the maximum
 * ```
 */
export function minuteIntervalOf(increment: number | undefined): number {
  if (
    increment == null ||
    !Number.isInteger(increment) ||
    increment < 1 ||
    increment > datePicker.wheels.minuteIntervalMax ||
    60 % increment !== 0
  ) {
    return 1;
  }
  return increment;
}

/** Whether the hour falls in the PM half (1) or the AM half (0). */
export function meridiemOf(hour: number): 0 | 1 {
  return hour < 12 ? 0 : 1;
}

/** The 12-hour clock's label for a 24-hour hour: 0 → 12, 13 → 1. */
export function hour12Of(hour: number): number {
  const h = hour % 12;
  return h === 0 ? 12 : h;
}

function secondsOf({hour, minute, second}: TimeParts): number {
  return hour * 3600 + minute * 60 + second;
}

function partsOf(seconds: number): TimeParts {
  const s = ((seconds % SECONDS_PER_DAY) + SECONDS_PER_DAY) % SECONDS_PER_DAY;
  return {
    hour: Math.floor(s / 3600),
    minute: Math.floor((s % 3600) / 60),
    second: s % 60,
  };
}

/** Whether [start, end] (seconds) overlaps the bounds. */
function overlaps(start: number, end: number, bounds: TimeBounds): boolean {
  return (
    (bounds.min == null || end >= bounds.min) &&
    (bounds.max == null || start <= bounds.max)
  );
}

/**
 * The time the wheels show for `time`: rounded to the minute interval (and
 * its seconds dropped when the picker has none), as UIDatePicker's
 * `roundsToMinuteInterval` rounds its date. 10:58 with a 15-minute interval
 * shows 11:00; 23:58 shows 00:00.
 */
export function displayedTime(
  time: TimeParts,
  interval: number,
  hasSeconds: boolean,
): TimeParts {
  if (interval <= 1) {
    return hasSeconds ? time : {...time, second: 0};
  }
  const minutes = time.hour * 60 + time.minute + time.second / 60;
  const rounded = Math.round(minutes / interval) * interval;
  return partsOf(rounded * 60);
}

/**
 * The hour the hour column makes when it comes to rest on `row` from `from`
 * (24-hour). 24-hour time: the row is the hour. 12-hour time: the time moves
 * by the rows turned, read as the shorter way round from the row shown, so a
 * turn across 11 ↔ 12 changes AM to PM or back and a turn from 12 to 1 keeps
 * it. A row six away either way keeps the half of the day.
 *
 * @example
 * ```
 * hourAfterTurn(11, 12, '12h'); // 12: 11 AM → 12 PM
 * hourAfterTurn(12, 1, '12h'); // 13: 12 PM → 1 PM
 * hourAfterTurn(15, 11, '12h'); // 11: 3 PM, four rows back → 11 AM
 * ```
 */
export function hourAfterTurn(
  from: number,
  row: number,
  hourFormat: '12h' | '24h',
): number {
  if (hourFormat === '24h') {
    return row;
  }
  const forward = ((((row % 12) - (from % 12)) % 12) + 12) % 12;
  if (forward === 6) {
    // Six rows either way: keep the half of the day.
    return (from < 12 ? 0 : 12) + (row % 12);
  }
  const turned = forward < 6 ? forward : forward - 12;
  return (from + turned + 24) % 24;
}

/**
 * The hour column. 24-hour time: 00 … 23. 12-hour time: 1 … 12, each row
 * standing for the hour a turn onto it from `from` makes
 * (`hourAfterTurn`). A row is disabled when no minute of that hour is inside
 * the bounds.
 */
export function hourRows(
  from: number,
  hourFormat: '12h' | '24h',
  bounds: TimeBounds,
): TimeRow[] {
  const hourAt = (row: number) => hourAfterTurn(from, row, hourFormat);
  const rows =
    hourFormat === '24h'
      ? Array.from({length: 24}, (_, hour) => hour)
      : Array.from({length: 12}, (_, index) => index + 1);
  return rows.map(row => {
    const hour = hourAt(row);
    return {
      value: row,
      label: hourFormat === '24h' ? String(row).padStart(2, '0') : String(row),
      isDisabled: !overlaps(hour * 3600, hour * 3600 + 3599, bounds),
    };
  });
}

/**
 * The minute column for `hour`: every `interval`-th minute. A row is
 * disabled when it is outside the bounds (its whole minute, when the picker
 * shows seconds).
 */
export function minuteRows(
  hour: number,
  interval: number,
  hasSeconds: boolean,
  bounds: TimeBounds,
): TimeRow[] {
  const rows: TimeRow[] = [];
  for (let minute = 0; minute < 60; minute += interval) {
    const start = hour * 3600 + minute * 60;
    rows.push({
      value: minute,
      label: String(minute).padStart(2, '0'),
      isDisabled: !overlaps(start, start + (hasSeconds ? 59 : 0), bounds),
    });
  }
  return rows;
}

/** The second column for `hour`:`minute`. */
export function secondRows(
  hour: number,
  minute: number,
  bounds: TimeBounds,
): TimeRow[] {
  return Array.from({length: 60}, (_, second): TimeRow => {
    const at = hour * 3600 + minute * 60 + second;
    return {
      value: second,
      label: String(second).padStart(2, '0'),
      isDisabled: !overlaps(at, at, bounds),
    };
  });
}

/** The AM/PM column: a half is disabled when none of its hours is in bounds. */
export function meridiemRows(
  labels: {am: string; pm: string},
  bounds: TimeBounds,
): TimeRow[] {
  return [
    {
      value: 0,
      label: labels.am,
      isDisabled: !overlaps(0, 12 * 3600 - 1, bounds),
    },
    {
      value: 1,
      label: labels.pm,
      isDisabled: !overlaps(12 * 3600, SECONDS_PER_DAY - 1, bounds),
    },
  ];
}

/**
 * The time made by turning `column` to `value` (its row's value) from `from`
 * (the time the wheels show). Only that column changes: minutes do not carry
 * into the hour, and the AM/PM column moves the hour by twelve.
 */
export function turnColumn(
  from: TimeParts,
  column: TimeColumn,
  value: number,
  hourFormat: '12h' | '24h',
): TimeParts {
  switch (column) {
    case 'hour':
      return {...from, hour: hourAfterTurn(from.hour, value, hourFormat)};
    case 'minute':
      return {...from, minute: value};
    case 'second':
      return {...from, second: value};
    case 'meridiem':
      return {...from, hour: (from.hour % 12) + 12 * value};
  }
}

/** `time` brought inside the bounds: past a bound, onto it. */
export function clampToBounds(time: TimeParts, bounds: TimeBounds): TimeParts {
  const seconds = secondsOf(time);
  if (bounds.min != null && seconds < bounds.min) {
    return partsOf(bounds.min);
  }
  if (bounds.max != null && seconds > bounds.max) {
    return partsOf(bounds.max);
  }
  return time;
}

/** What a column shows for a time: its row's value. */
export function columnValue(
  time: TimeParts,
  column: TimeColumn,
  hourFormat: '12h' | '24h',
): number {
  switch (column) {
    case 'hour':
      return hourFormat === '24h' ? time.hour : hour12Of(time.hour);
    case 'minute':
      return time.minute;
    case 'second':
      return time.second;
    case 'meridiem':
      return meridiemOf(time.hour);
  }
}

/**
 * The columns that must turn after `column` came to rest on `value`: every
 * column whose row for the committed time differs from the row it shows now.
 * The column that moved shows `value`; the others show `from`. An hour that
 * crossed 11 ↔ 12 turns the AM/PM column; a time brought back onto a bound
 * turns every column whose row changed.
 */
export function columnsToTurn(
  from: TimeParts,
  column: TimeColumn,
  value: number,
  committed: TimeParts,
  options: {hourFormat: '12h' | '24h'; hasSeconds: boolean},
): {column: TimeColumn; value: number}[] {
  const columns: TimeColumn[] = ['hour', 'minute'];
  if (options.hasSeconds) {
    columns.push('second');
  }
  if (options.hourFormat === '12h') {
    columns.push('meridiem');
  }
  const turns: {column: TimeColumn; value: number}[] = [];
  for (const each of columns) {
    const shown =
      each === column ? value : columnValue(from, each, options.hourFormat);
    const target = columnValue(committed, each, options.hourFormat);
    if (shown !== target) {
      turns.push({column: each, value: target});
    }
  }
  return turns;
}
