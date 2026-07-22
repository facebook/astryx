// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {
  type PlainDate,
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
  formatSharedDate,
  DATE_FORMAT_WITH_WEEKDAY,
} from './plainDate';
import type {ISODateString} from './dateTypes';

describe('plainDateCreate', () => {
  it('creates a valid PlainDate', () => {
    expect(plainDateCreate(2026, 1, 25)).toEqual({
      year: 2026,
      month: 1,
      day: 25,
    });
  });

  it('throws for year < 1', () => {
    expect(() => plainDateCreate(0, 1, 1)).toThrow(RangeError);
  });

  it('throws for negative year', () => {
    expect(() => plainDateCreate(-1, 1, 1)).toThrow(RangeError);
  });

  it('throws for non-integer year', () => {
    expect(() => plainDateCreate(2026.5, 1, 1)).toThrow(RangeError);
  });

  it('throws for non-integer month', () => {
    expect(() => plainDateCreate(2026, 1.5, 1)).toThrow(RangeError);
  });

  it('throws for non-integer day', () => {
    expect(() => plainDateCreate(2026, 1, 1.5)).toThrow(RangeError);
  });

  it('throws for month < 1', () => {
    expect(() => plainDateCreate(2026, 0, 1)).toThrow(RangeError);
  });

  it('throws for month > 12', () => {
    expect(() => plainDateCreate(2026, 13, 1)).toThrow(RangeError);
  });

  it('throws for day < 1', () => {
    expect(() => plainDateCreate(2026, 1, 0)).toThrow(RangeError);
  });

  it('throws for day exceeding month length', () => {
    expect(() => plainDateCreate(2026, 2, 29)).toThrow(RangeError);
  });

  it('allows Feb 29 in a leap year', () => {
    expect(plainDateCreate(2024, 2, 29)).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });
  });

  it('throws for Feb 30 even in a leap year', () => {
    expect(() => plainDateCreate(2024, 2, 30)).toThrow(RangeError);
  });
});

describe('plainDateFromISO', () => {
  it('parses a standard ISO date', () => {
    expect(plainDateFromISO('2026-01-25')).toEqual({
      year: 2026,
      month: 1,
      day: 25,
    });
  });

  it('parses date with 1-based month', () => {
    const dec = plainDateFromISO('2026-12-31');
    expect(dec.month).toBe(12);
  });

  it('handles single-digit month/day when padded', () => {
    expect(plainDateFromISO('2026-03-05')).toEqual({
      year: 2026,
      month: 3,
      day: 5,
    });
  });
});

describe('plainDateToISO', () => {
  it('formats a PlainDate to ISO string', () => {
    expect(plainDateToISO({year: 2026, month: 1, day: 25})).toBe('2026-01-25');
  });

  it('pads single-digit month and day', () => {
    expect(plainDateToISO({year: 2026, month: 3, day: 5})).toBe('2026-03-05');
  });

  it('pads year to 4 digits', () => {
    expect(plainDateToISO({year: 1, month: 1, day: 1})).toBe('0001-01-01');
  });
});

describe('plainDateFromISO / plainDateToISO roundtrip', () => {
  it.each([
    '2026-01-01',
    '2026-06-15',
    '2026-12-31',
    '2000-02-29',
    '1999-11-30',
  ])('roundtrips %s', iso => {
    expect(plainDateToISO(plainDateFromISO(iso as ISODateString))).toBe(iso);
  });
});

describe('plainDateToDate / plainDateFromDate', () => {
  it('converts PlainDate to Date and back', () => {
    const pd: PlainDate = {year: 2026, month: 3, day: 15};
    const d = plainDateToDate(pd);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(2); // 0-based
    expect(d.getDate()).toBe(15);
    expect(plainDateFromDate(d)).toEqual(pd);
  });
});

describe('plainDateToday', () => {
  it('returns current date with 1-based month', () => {
    const t = plainDateToday();
    const now = new Date();
    expect(t.year).toBe(now.getFullYear());
    expect(t.month).toBe(now.getMonth() + 1);
    expect(t.day).toBe(now.getDate());
  });
});

describe('getDaysInMonth', () => {
  it('returns 31 for January', () => {
    expect(getDaysInMonth(2026, 1)).toBe(31);
  });

  it('returns 28 for February in a non-leap year', () => {
    expect(getDaysInMonth(2026, 2)).toBe(28);
  });

  it('returns 29 for February in a leap year', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it('returns 30 for April', () => {
    expect(getDaysInMonth(2026, 4)).toBe(30);
  });

  it('handles century non-leap year', () => {
    expect(getDaysInMonth(1900, 2)).toBe(28);
  });

  it('handles 400-year leap year', () => {
    expect(getDaysInMonth(2000, 2)).toBe(29);
  });
});

describe('plainDateDayOfWeek', () => {
  it('returns 0 for a known Sunday', () => {
    // 2026-01-04 is a Sunday
    expect(plainDateDayOfWeek({year: 2026, month: 1, day: 4})).toBe(0);
  });

  it('returns 1 for a known Monday', () => {
    // 2026-01-05 is a Monday
    expect(plainDateDayOfWeek({year: 2026, month: 1, day: 5})).toBe(1);
  });

  it('returns 6 for a known Saturday', () => {
    // 2026-01-03 is a Saturday
    expect(plainDateDayOfWeek({year: 2026, month: 1, day: 3})).toBe(6);
  });
});

describe('plainDateAddMonths', () => {
  it('adds months within the same year', () => {
    expect(plainDateAddMonths({year: 2026, month: 1, day: 15}, 3)).toEqual({
      year: 2026,
      month: 4,
      day: 15,
    });
  });

  it('rolls over to the next year', () => {
    expect(plainDateAddMonths({year: 2026, month: 11, day: 15}, 3)).toEqual({
      year: 2027,
      month: 2,
      day: 15,
    });
  });

  it('subtracts months', () => {
    expect(plainDateAddMonths({year: 2026, month: 3, day: 15}, -2)).toEqual({
      year: 2026,
      month: 1,
      day: 15,
    });
  });

  it('rolls back to previous year', () => {
    expect(plainDateAddMonths({year: 2026, month: 1, day: 15}, -2)).toEqual({
      year: 2025,
      month: 11,
      day: 15,
    });
  });

  it('overflows day into next month when target month is shorter', () => {
    expect(plainDateAddMonths({year: 2026, month: 1, day: 31}, 1)).toEqual({
      year: 2026,
      month: 3,
      day: 3,
    });
  });

  it('overflows Jan 31 + 1 month in leap year', () => {
    expect(plainDateAddMonths({year: 2024, month: 1, day: 31}, 1)).toEqual({
      year: 2024,
      month: 3,
      day: 2,
    });
  });
});

describe('plainDateAddDays', () => {
  it('adds days within the same month', () => {
    expect(plainDateAddDays({year: 2026, month: 1, day: 15}, 5)).toEqual({
      year: 2026,
      month: 1,
      day: 20,
    });
  });

  it('rolls over to next month', () => {
    expect(plainDateAddDays({year: 2026, month: 1, day: 30}, 3)).toEqual({
      year: 2026,
      month: 2,
      day: 2,
    });
  });

  it('rolls over to next year', () => {
    expect(plainDateAddDays({year: 2026, month: 12, day: 30}, 3)).toEqual({
      year: 2027,
      month: 1,
      day: 2,
    });
  });

  it('subtracts days', () => {
    expect(plainDateAddDays({year: 2026, month: 1, day: 15}, -5)).toEqual({
      year: 2026,
      month: 1,
      day: 10,
    });
  });

  it('rolls back to previous month', () => {
    expect(plainDateAddDays({year: 2026, month: 2, day: 1}, -1)).toEqual({
      year: 2026,
      month: 1,
      day: 31,
    });
  });
});

describe('plainDateToInstant / plainDateFromInstant', () => {
  it('converts a PlainDate to midnight in the requested timezone', () => {
    expect(
      plainDateToInstant(
        {year: 2026, month: 5, day: 13},
        'America/Los_Angeles',
      ),
    ).toBe(Date.UTC(2026, 4, 13, 7));
  });

  it('roundtrips a PlainDate in the requested timezone', () => {
    const date: PlainDate = {year: 2026, month: 5, day: 13};
    expect(
      plainDateFromInstant(
        plainDateToInstant(date, 'America/Los_Angeles'),
        'America/Los_Angeles',
      ),
    ).toEqual(date);
  });

  it('supports explicit time components', () => {
    expect(
      plainDateToInstant(
        {year: 2026, month: 5, day: 13},
        'America/Los_Angeles',
        9,
        30,
      ),
    ).toBe(Date.UTC(2026, 4, 13, 16, 30));
  });
});

describe('plainDateIsBefore / plainDateIsAfter', () => {
  it('returns false for equal dates (isBefore)', () => {
    expect(
      plainDateIsBefore(
        {year: 2026, month: 1, day: 15},
        {year: 2026, month: 1, day: 15},
      ),
    ).toBe(false);
  });

  it('returns false for equal dates (isAfter)', () => {
    expect(
      plainDateIsAfter(
        {year: 2026, month: 1, day: 15},
        {year: 2026, month: 1, day: 15},
      ),
    ).toBe(false);
  });

  it('returns true when first is earlier (isBefore)', () => {
    expect(
      plainDateIsBefore(
        {year: 2026, month: 1, day: 14},
        {year: 2026, month: 1, day: 15},
      ),
    ).toBe(true);
  });

  it('returns true when first is later (isAfter)', () => {
    expect(
      plainDateIsAfter(
        {year: 2026, month: 1, day: 16},
        {year: 2026, month: 1, day: 15},
      ),
    ).toBe(true);
  });

  it('compares by year first', () => {
    expect(
      plainDateIsBefore(
        {year: 2025, month: 12, day: 31},
        {year: 2026, month: 1, day: 1},
      ),
    ).toBe(true);
  });

  it('compares by month when years equal', () => {
    expect(
      plainDateIsBefore(
        {year: 2026, month: 1, day: 31},
        {year: 2026, month: 2, day: 1},
      ),
    ).toBe(true);
  });
});

describe('plainDateIsEqual', () => {
  it('returns true for same date', () => {
    expect(
      plainDateIsEqual(
        {year: 2026, month: 1, day: 15},
        {year: 2026, month: 1, day: 15},
      ),
    ).toBe(true);
  });

  it('returns false for different day', () => {
    expect(
      plainDateIsEqual(
        {year: 2026, month: 1, day: 15},
        {year: 2026, month: 1, day: 16},
      ),
    ).toBe(false);
  });

  it('returns false for different month', () => {
    expect(
      plainDateIsEqual(
        {year: 2026, month: 1, day: 15},
        {year: 2026, month: 2, day: 15},
      ),
    ).toBe(false);
  });
});

describe('plainDateMax / plainDateMin', () => {
  const earlier: PlainDate = {year: 2026, month: 1, day: 14};
  const later: PlainDate = {year: 2026, month: 1, day: 15};

  it('returns the later date for max', () => {
    expect(plainDateMax(earlier, later)).toBe(later);
    expect(plainDateMax(later, earlier)).toBe(later);
  });

  it('returns the earlier date for min', () => {
    expect(plainDateMin(earlier, later)).toBe(earlier);
    expect(plainDateMin(later, earlier)).toBe(earlier);
  });

  it('returns the first date when dates are equal', () => {
    const equal: PlainDate = {year: 2026, month: 1, day: 15};
    expect(plainDateMax(later, equal)).toBe(later);
    expect(plainDateMin(later, equal)).toBe(later);
  });
});

describe('plainDateIsInRange', () => {
  const start: PlainDate = {year: 2026, month: 1, day: 10};
  const end: PlainDate = {year: 2026, month: 1, day: 20};

  it('returns true for date within range', () => {
    expect(
      plainDateIsInRange({year: 2026, month: 1, day: 15}, [start, end]),
    ).toBe(true);
  });

  it('returns true for start boundary', () => {
    expect(plainDateIsInRange(start, [start, end])).toBe(true);
  });

  it('returns true for end boundary', () => {
    expect(plainDateIsInRange(end, [start, end])).toBe(true);
  });

  it('returns false for date before range', () => {
    expect(
      plainDateIsInRange({year: 2026, month: 1, day: 9}, [start, end]),
    ).toBe(false);
  });

  it('returns false for date after range', () => {
    expect(
      plainDateIsInRange({year: 2026, month: 1, day: 21}, [start, end]),
    ).toBe(false);
  });
});

describe('plainDateSetStartOfWeek / plainDateSetEndOfWeekExclusive', () => {
  it('returns the start of the week for a Sunday-start week', () => {
    expect(plainDateSetStartOfWeek({year: 2026, month: 5, day: 13}, 0)).toEqual(
      {year: 2026, month: 5, day: 10},
    );
  });

  it('returns the start of the week for a Monday-start week', () => {
    expect(plainDateSetStartOfWeek({year: 2026, month: 5, day: 13}, 1)).toEqual(
      {year: 2026, month: 5, day: 11},
    );
  });

  it('returns the exclusive end of the week', () => {
    expect(
      plainDateSetEndOfWeekExclusive({year: 2026, month: 5, day: 13}, 0),
    ).toEqual({year: 2026, month: 5, day: 17});
  });
});

describe('plainDateSetFirstOfMonth', () => {
  it('returns first day of the same month', () => {
    expect(plainDateSetFirstOfMonth({year: 2026, month: 3, day: 15})).toEqual({
      year: 2026,
      month: 3,
      day: 1,
    });
  });

  it('is a no-op for day 1', () => {
    const pd = {year: 2026, month: 3, day: 1};
    expect(plainDateSetFirstOfMonth(pd)).toEqual(pd);
  });
});

describe('plainDateGetWeekNumber', () => {
  it('returns week 1 for Jan 1 2026 (Thursday)', () => {
    expect(plainDateGetWeekNumber({year: 2026, month: 1, day: 1})).toBe(1);
  });

  it('returns week 53 for Dec 31 2020 (Thursday in ISO week 53)', () => {
    expect(plainDateGetWeekNumber({year: 2020, month: 12, day: 31})).toBe(53);
  });

  it('returns week 1 for Jan 4 (always in ISO week 1)', () => {
    expect(plainDateGetWeekNumber({year: 2026, month: 1, day: 4})).toBe(1);
  });
});

describe('plainDateFormat', () => {
  it('returns a human-readable date string with weekday', () => {
    const result = plainDateFormat(
      {year: 2026, month: 1, day: 25},
      DATE_FORMAT_WITH_WEEKDAY,
    );
    expect(result).toContain('2026');
    expect(result).toContain('25');
  });
});

describe('formatSharedDate', () => {
  const pd: PlainDate = {year: 2026, month: 1, day: 25};

  it('formats the short-month "date" shape', () => {
    expect(formatSharedDate(pd, 'date')).toBe('Jan 25, 2026');
  });

  it('formats the long-month "date_long" shape', () => {
    expect(formatSharedDate(pd, 'date_long')).toBe('January 25, 2026');
  });

  it('formats the weekday "date_weekday" shape', () => {
    // 2026-01-25 is a Sunday.
    expect(formatSharedDate(pd, 'date_weekday')).toBe('Sun, Jan 25, 2026');
  });

  it('formats the ISO "system_date" shape', () => {
    expect(formatSharedDate(pd, 'system_date')).toBe('2026-01-25');
  });
});
