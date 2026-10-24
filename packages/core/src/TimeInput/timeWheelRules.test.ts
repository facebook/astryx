// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file timeWheelRules.test.ts
 * @input vitest, the time wheels' pure rules
 * @output Checks UIDatePicker's time-wheel rules as timeWheelRules.ts encodes
 *   them: the minute interval, the rounding to it, the hour column's turn
 *   across 11 ↔ 12, minutes that do not carry, the bounds, and which columns
 *   turn with a change
 * @position Testing; the component around these rules is TimeWheels.test.tsx
 */

import {describe, expect, it} from 'vitest';
import {
  clampToBounds,
  columnsToTurn,
  displayedTime,
  hourAfterTurn,
  hourRows,
  minuteIntervalOf,
  minuteRows,
  turnColumn,
  type TimeBounds,
  type TimeParts,
} from './timeWheelRules';

const at = (hour: number, minute: number, second = 0): TimeParts => ({
  hour,
  minute,
  second,
});
const UNBOUNDED: TimeBounds = {min: null, max: null};
const NINE_TO_FIVE: TimeBounds = {min: 9 * 3600, max: 17 * 3600};

describe('minuteIntervalOf (UIDatePicker.minuteInterval)', () => {
  it('keeps an interval that divides 60, up to 30', () => {
    for (const interval of [1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30]) {
      expect(minuteIntervalOf(interval)).toBe(interval);
    }
  });

  it('falls back to 1 for anything else', () => {
    for (const interval of [undefined, 0, -5, 7, 45, 60, 2.5, Number.NaN]) {
      expect(minuteIntervalOf(interval)).toBe(1);
    }
  });
});

describe('displayedTime (roundsToMinuteInterval)', () => {
  it('rounds to the nearest interval, carrying into the hour', () => {
    expect(displayedTime(at(10, 7), 15, false)).toEqual(at(10, 0));
    expect(displayedTime(at(10, 8), 15, false)).toEqual(at(10, 15));
    expect(displayedTime(at(10, 58), 15, false)).toEqual(at(11, 0));
    expect(displayedTime(at(23, 58), 15, false)).toEqual(at(0, 0));
  });

  it('shows a time on the interval as it is, and drops seconds it cannot show', () => {
    expect(displayedTime(at(10, 45), 15, false)).toEqual(at(10, 45));
    expect(displayedTime(at(10, 45, 30), 1, false)).toEqual(at(10, 45));
    expect(displayedTime(at(10, 45, 30), 1, true)).toEqual(at(10, 45, 30));
  });
});

describe('the hour column', () => {
  it('turns AM to PM across 11 → 12 and back, and keeps it across 12 → 1', () => {
    // UIKit: 11:58 AM, hour +1 → 12:58 PM; +1 → 1:02 PM.
    expect(hourAfterTurn(11, 12, '12h')).toBe(12);
    expect(hourAfterTurn(12, 1, '12h')).toBe(13);
    expect(hourAfterTurn(12, 11, '12h')).toBe(11);
    expect(hourAfterTurn(23, 12, '12h')).toBe(0);
    expect(hourAfterTurn(0, 11, '12h')).toBe(23);
  });

  it('moves the time by the rows turned, the shorter way round', () => {
    // UIKit: +4 rows from 11 AM → 3 PM; −4 back → 11 AM.
    expect(hourAfterTurn(11, 3, '12h')).toBe(15);
    expect(hourAfterTurn(15, 11, '12h')).toBe(11);
    expect(hourAfterTurn(10, 8, '12h')).toBe(8);
  });

  it('keeps the half of the day for a row six away either way', () => {
    expect(hourAfterTurn(21, 3, '12h')).toBe(15);
    expect(hourAfterTurn(9, 3, '12h')).toBe(3);
  });

  it('is the hour itself in 24-hour time', () => {
    expect(hourAfterTurn(11, 23, '24h')).toBe(23);
  });

  it('labels 12-hour rows 1 to 12 and disables the hours a turn would make outside the bounds', () => {
    const rows = hourRows(11, '12h', NINE_TO_FIVE);
    expect(rows.map(row => row.label)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
    ]);
    // From 11 AM: 12 to 4 are reached forwards (PM, inside), 5 is six rows
    // either way (keeps AM, outside), 6 to 8 are reached backwards (AM,
    // outside).
    expect(rows.filter(row => row.isDisabled).map(row => row.label)).toEqual([
      '5',
      '6',
      '7',
      '8',
    ]);
  });

  it('labels 24-hour rows 00 to 23', () => {
    const rows = hourRows(11, '24h', NINE_TO_FIVE);
    expect(rows[0].label).toBe('00');
    expect(rows[23].label).toBe('23');
    expect(rows[8].isDisabled).toBe(true);
    expect(rows[9].isDisabled).toBe(false);
    expect(rows[17].isDisabled).toBe(false);
    expect(rows[18].isDisabled).toBe(true);
  });
});

describe('the minute column', () => {
  it('shows every n-th minute', () => {
    expect(minuteRows(10, 15, false, UNBOUNDED).map(row => row.label)).toEqual([
      '00',
      '15',
      '30',
      '45',
    ]);
    expect(minuteRows(10, 1, false, UNBOUNDED)).toHaveLength(60);
  });

  it('does not carry into the hour', () => {
    // UIKit: 12:58 PM, minute +4 rows → 12:02 PM.
    expect(turnColumn(at(12, 58), 'minute', 2, '12h')).toEqual(at(12, 2));
  });
});

describe('turnColumn', () => {
  it('moves the hour by twelve for an AM/PM turn', () => {
    expect(turnColumn(at(11, 30), 'meridiem', 1, '12h')).toEqual(at(23, 30));
    expect(turnColumn(at(23, 30), 'meridiem', 0, '12h')).toEqual(at(11, 30));
    expect(turnColumn(at(12, 0), 'meridiem', 0, '12h')).toEqual(at(0, 0));
  });
});

describe('clampToBounds (restPastBound)', () => {
  it('brings a time past a bound onto it', () => {
    expect(clampToBounds(at(7, 0), NINE_TO_FIVE)).toEqual(at(9, 0));
    expect(clampToBounds(at(18, 15), NINE_TO_FIVE)).toEqual(at(17, 0));
    expect(clampToBounds(at(12, 0), NINE_TO_FIVE)).toEqual(at(12, 0));
  });
});

describe('columnsToTurn', () => {
  const twelveHour = {hourFormat: '12h', hasSeconds: false} as const;

  it('turns the AM/PM column after the hour crossed 11 → 12', () => {
    const from = at(11, 58);
    const committed = turnColumn(from, 'hour', 12, '12h');
    expect(columnsToTurn(from, 'hour', 12, committed, twelveHour)).toEqual([
      {column: 'meridiem', value: 1},
    ]);
  });

  it('turns nothing for an hour that kept its half of the day', () => {
    const from = at(12, 58);
    const committed = turnColumn(from, 'hour', 1, '12h');
    expect(columnsToTurn(from, 'hour', 1, committed, twelveHour)).toEqual([]);
  });

  it('leaves the hour where it is for an AM/PM turn', () => {
    const from = at(11, 30);
    const committed = turnColumn(from, 'meridiem', 1, '12h');
    expect(columnsToTurn(from, 'meridiem', 1, committed, twelveHour)).toEqual(
      [],
    );
  });

  it('turns every column whose row a bound changed', () => {
    // 10:15 with the hour turned to 9 and a 9:30 minimum: the minutes turn to
    // 30.
    const bounds = {min: 9 * 3600 + 30 * 60, max: null};
    const from = at(10, 15);
    const committed = clampToBounds(turnColumn(from, 'hour', 9, '12h'), bounds);
    expect(committed).toEqual(at(9, 30));
    expect(columnsToTurn(from, 'hour', 9, committed, twelveHour)).toEqual([
      {column: 'minute', value: 30},
    ]);
  });

  it('turns the hour and minutes onto the maximum after an AM/PM turn past it', () => {
    const from = at(11, 30);
    const committed = clampToBounds(
      turnColumn(from, 'meridiem', 1, '12h'),
      NINE_TO_FIVE,
    );
    expect(committed).toEqual(at(17, 0));
    expect(columnsToTurn(from, 'meridiem', 1, committed, twelveHour)).toEqual([
      {column: 'hour', value: 5},
      {column: 'minute', value: 0},
    ]);
  });
});
