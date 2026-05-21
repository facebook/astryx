// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {
  type PlainDate,
  fromISO,
  toISO,
  toDate,
  fromDate,
  today,
  daysInMonth,
  dayOfWeek,
  addMonths,
  addDays,
  compare,
  isSameDay,
  isInRange,
  firstOfMonth,
  getWeekNumber,
  formatAccessible,
} from './plainDate';
import type {ISODateString} from '../Calendar/XDSCalendar';

describe('fromISO', () => {
  it('parses a standard ISO date', () => {
    expect(fromISO('2026-01-25' as ISODateString)).toEqual({
      year: 2026,
      month: 1,
      day: 25,
    });
  });

  it('parses date with 1-based month', () => {
    const dec = fromISO('2026-12-31' as ISODateString);
    expect(dec.month).toBe(12);
  });

  it('handles single-digit month/day when padded', () => {
    expect(fromISO('2026-03-05' as ISODateString)).toEqual({
      year: 2026,
      month: 3,
      day: 5,
    });
  });
});

describe('toISO', () => {
  it('formats a PlainDate to ISO string', () => {
    expect(toISO({year: 2026, month: 1, day: 25})).toBe('2026-01-25');
  });

  it('pads single-digit month and day', () => {
    expect(toISO({year: 2026, month: 3, day: 5})).toBe('2026-03-05');
  });

  it('pads year to 4 digits', () => {
    expect(toISO({year: 1, month: 1, day: 1})).toBe('0001-01-01');
  });
});

describe('fromISO ↔ toISO roundtrip', () => {
  it.each([
    '2026-01-01',
    '2026-06-15',
    '2026-12-31',
    '2000-02-29',
    '1999-11-30',
  ])('roundtrips %s', iso => {
    expect(toISO(fromISO(iso as ISODateString))).toBe(iso);
  });
});

describe('toDate / fromDate', () => {
  it('converts PlainDate to Date and back', () => {
    const pd: PlainDate = {year: 2026, month: 3, day: 15};
    const d = toDate(pd);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(2); // 0-based
    expect(d.getDate()).toBe(15);
    expect(fromDate(d)).toEqual(pd);
  });
});

describe('today', () => {
  it('returns current date with 1-based month', () => {
    const t = today();
    const now = new Date();
    expect(t.year).toBe(now.getFullYear());
    expect(t.month).toBe(now.getMonth() + 1);
    expect(t.day).toBe(now.getDate());
  });
});

describe('daysInMonth', () => {
  it('returns 31 for January', () => {
    expect(daysInMonth(2026, 1)).toBe(31);
  });

  it('returns 28 for February in a non-leap year', () => {
    expect(daysInMonth(2026, 2)).toBe(28);
  });

  it('returns 29 for February in a leap year', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
  });

  it('returns 30 for April', () => {
    expect(daysInMonth(2026, 4)).toBe(30);
  });

  it('handles century non-leap year', () => {
    expect(daysInMonth(1900, 2)).toBe(28);
  });

  it('handles 400-year leap year', () => {
    expect(daysInMonth(2000, 2)).toBe(29);
  });
});

describe('dayOfWeek', () => {
  it('returns 0 for a known Sunday', () => {
    // 2026-01-04 is a Sunday
    expect(dayOfWeek({year: 2026, month: 1, day: 4})).toBe(0);
  });

  it('returns 1 for a known Monday', () => {
    // 2026-01-05 is a Monday
    expect(dayOfWeek({year: 2026, month: 1, day: 5})).toBe(1);
  });

  it('returns 6 for a known Saturday', () => {
    // 2026-01-03 is a Saturday
    expect(dayOfWeek({year: 2026, month: 1, day: 3})).toBe(6);
  });
});

describe('addMonths', () => {
  it('adds months within the same year', () => {
    expect(addMonths({year: 2026, month: 1, day: 15}, 3)).toEqual({
      year: 2026,
      month: 4,
      day: 15,
    });
  });

  it('rolls over to the next year', () => {
    expect(addMonths({year: 2026, month: 11, day: 15}, 3)).toEqual({
      year: 2027,
      month: 2,
      day: 15,
    });
  });

  it('subtracts months', () => {
    expect(addMonths({year: 2026, month: 3, day: 15}, -2)).toEqual({
      year: 2026,
      month: 1,
      day: 15,
    });
  });

  it('rolls back to previous year', () => {
    expect(addMonths({year: 2026, month: 1, day: 15}, -2)).toEqual({
      year: 2025,
      month: 11,
      day: 15,
    });
  });

  it('clamps day when target month is shorter', () => {
    expect(addMonths({year: 2026, month: 1, day: 31}, 1)).toEqual({
      year: 2026,
      month: 2,
      day: 28,
    });
  });

  it('clamps day to Feb 29 in leap year', () => {
    expect(addMonths({year: 2024, month: 1, day: 31}, 1)).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });
  });
});

describe('addDays', () => {
  it('adds days within the same month', () => {
    expect(addDays({year: 2026, month: 1, day: 15}, 5)).toEqual({
      year: 2026,
      month: 1,
      day: 20,
    });
  });

  it('rolls over to next month', () => {
    expect(addDays({year: 2026, month: 1, day: 30}, 3)).toEqual({
      year: 2026,
      month: 2,
      day: 2,
    });
  });

  it('rolls over to next year', () => {
    expect(addDays({year: 2026, month: 12, day: 30}, 3)).toEqual({
      year: 2027,
      month: 1,
      day: 2,
    });
  });

  it('subtracts days', () => {
    expect(addDays({year: 2026, month: 1, day: 15}, -5)).toEqual({
      year: 2026,
      month: 1,
      day: 10,
    });
  });

  it('rolls back to previous month', () => {
    expect(addDays({year: 2026, month: 2, day: 1}, -1)).toEqual({
      year: 2026,
      month: 1,
      day: 31,
    });
  });
});

describe('compare', () => {
  it('returns 0 for equal dates', () => {
    expect(
      compare({year: 2026, month: 1, day: 15}, {year: 2026, month: 1, day: 15}),
    ).toBe(0);
  });

  it('returns negative when first is earlier', () => {
    expect(
      compare({year: 2026, month: 1, day: 14}, {year: 2026, month: 1, day: 15}),
    ).toBeLessThan(0);
  });

  it('returns positive when first is later', () => {
    expect(
      compare({year: 2026, month: 1, day: 16}, {year: 2026, month: 1, day: 15}),
    ).toBeGreaterThan(0);
  });

  it('compares by year first', () => {
    expect(
      compare({year: 2025, month: 12, day: 31}, {year: 2026, month: 1, day: 1}),
    ).toBeLessThan(0);
  });

  it('compares by month when years equal', () => {
    expect(
      compare({year: 2026, month: 1, day: 31}, {year: 2026, month: 2, day: 1}),
    ).toBeLessThan(0);
  });
});

describe('isSameDay', () => {
  it('returns true for same date', () => {
    expect(
      isSameDay(
        {year: 2026, month: 1, day: 15},
        {year: 2026, month: 1, day: 15},
      ),
    ).toBe(true);
  });

  it('returns false for different day', () => {
    expect(
      isSameDay(
        {year: 2026, month: 1, day: 15},
        {year: 2026, month: 1, day: 16},
      ),
    ).toBe(false);
  });

  it('returns false for different month', () => {
    expect(
      isSameDay(
        {year: 2026, month: 1, day: 15},
        {year: 2026, month: 2, day: 15},
      ),
    ).toBe(false);
  });
});

describe('isInRange', () => {
  const start: PlainDate = {year: 2026, month: 1, day: 10};
  const end: PlainDate = {year: 2026, month: 1, day: 20};

  it('returns true for date within range', () => {
    expect(isInRange({year: 2026, month: 1, day: 15}, start, end)).toBe(true);
  });

  it('returns true for start boundary', () => {
    expect(isInRange(start, start, end)).toBe(true);
  });

  it('returns true for end boundary', () => {
    expect(isInRange(end, start, end)).toBe(true);
  });

  it('returns false for date before range', () => {
    expect(isInRange({year: 2026, month: 1, day: 9}, start, end)).toBe(false);
  });

  it('returns false for date after range', () => {
    expect(isInRange({year: 2026, month: 1, day: 21}, start, end)).toBe(false);
  });
});

describe('firstOfMonth', () => {
  it('returns first day of the same month', () => {
    expect(firstOfMonth({year: 2026, month: 3, day: 15})).toEqual({
      year: 2026,
      month: 3,
      day: 1,
    });
  });

  it('is a no-op for day 1', () => {
    const pd = {year: 2026, month: 3, day: 1};
    expect(firstOfMonth(pd)).toEqual(pd);
  });
});

describe('getWeekNumber', () => {
  it('returns week 1 for Jan 1 2026 (Thursday)', () => {
    expect(getWeekNumber({year: 2026, month: 1, day: 1})).toBe(1);
  });

  it('returns week 53 for Dec 31 2020 (Thursday in ISO week 53)', () => {
    expect(getWeekNumber({year: 2020, month: 12, day: 31})).toBe(53);
  });

  it('returns week 1 for Jan 4 (always in ISO week 1)', () => {
    expect(getWeekNumber({year: 2026, month: 1, day: 4})).toBe(1);
  });
});

describe('formatAccessible', () => {
  it('returns a human-readable date string', () => {
    const result = formatAccessible({year: 2026, month: 1, day: 25});
    expect(result).toContain('2026');
    expect(result).toContain('25');
  });
});
