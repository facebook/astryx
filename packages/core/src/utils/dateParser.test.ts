/**
 * @file dateParser.test.ts
 * @input Uses vitest, dateParser utilities
 * @output Unit tests for date parsing utilities
 * @position Testing; validates dateParser.ts implementation
 *
 * SYNC: When dateParser.ts changes, update tests to match new behavior
 */

import {describe, it, expect} from 'vitest';
import {
  parseDateInput,
  formatDisplayDate,
  dateToISO,
  parseISO,
} from './dateParser';

describe('parseDateInput', () => {
  describe('ISO format (YYYY-MM-DD)', () => {
    it('parses valid ISO date', () => {
      expect(parseDateInput('2026-01-25')).toBe('2026-01-25');
    });

    it('parses ISO date with single-digit month/day', () => {
      expect(parseDateInput('2026-1-5')).toBe('2026-01-05');
    });

    it('returns null for invalid ISO date', () => {
      expect(parseDateInput('2026-13-25')).toBeNull();
      expect(parseDateInput('2026-02-30')).toBeNull();
    });
  });

  describe('full month name formats', () => {
    it('parses "January 25, 2026"', () => {
      expect(parseDateInput('January 25, 2026')).toBe('2026-01-25');
    });

    it('parses "Jan 25, 2026"', () => {
      expect(parseDateInput('Jan 25, 2026')).toBe('2026-01-25');
    });

    it('parses "25 January 2026"', () => {
      expect(parseDateInput('25 January 2026')).toBe('2026-01-25');
    });

    it('parses "25 Jan 2026"', () => {
      expect(parseDateInput('25 Jan 2026')).toBe('2026-01-25');
    });

    it('parses without comma', () => {
      expect(parseDateInput('January 25 2026')).toBe('2026-01-25');
    });

    it('handles case insensitive month names', () => {
      expect(parseDateInput('JANUARY 25, 2026')).toBe('2026-01-25');
      expect(parseDateInput('january 25, 2026')).toBe('2026-01-25');
    });

    it('parses all month names', () => {
      expect(parseDateInput('February 1, 2026')).toBe('2026-02-01');
      expect(parseDateInput('March 1, 2026')).toBe('2026-03-01');
      expect(parseDateInput('April 1, 2026')).toBe('2026-04-01');
      expect(parseDateInput('May 1, 2026')).toBe('2026-05-01');
      expect(parseDateInput('June 1, 2026')).toBe('2026-06-01');
      expect(parseDateInput('July 1, 2026')).toBe('2026-07-01');
      expect(parseDateInput('August 1, 2026')).toBe('2026-08-01');
      expect(parseDateInput('September 1, 2026')).toBe('2026-09-01');
      expect(parseDateInput('October 1, 2026')).toBe('2026-10-01');
      expect(parseDateInput('November 1, 2026')).toBe('2026-11-01');
      expect(parseDateInput('December 1, 2026')).toBe('2026-12-01');
    });

    it('parses abbreviated month names', () => {
      expect(parseDateInput('Feb 1, 2026')).toBe('2026-02-01');
      expect(parseDateInput('Sep 1, 2026')).toBe('2026-09-01');
      expect(parseDateInput('Sept 1, 2026')).toBe('2026-09-01');
    });
  });

  describe('formats without year (defaults to current year)', () => {
    const currentYear = new Date().getFullYear();

    it('parses "January 25" (month-first without year)', () => {
      expect(parseDateInput('January 25')).toBe(`${currentYear}-01-25`);
    });

    it('parses "Jan 25" (abbreviated month without year)', () => {
      expect(parseDateInput('Jan 25')).toBe(`${currentYear}-01-25`);
    });

    it('parses "25 January" (day-first without year)', () => {
      expect(parseDateInput('25 January')).toBe(`${currentYear}-01-25`);
    });

    it('parses "25 Jan" (day-first abbreviated without year)', () => {
      expect(parseDateInput('25 Jan')).toBe(`${currentYear}-01-25`);
    });

    it('parses "1/25" (numeric without year)', () => {
      expect(parseDateInput('1/25')).toBe(`${currentYear}-01-25`);
    });

    it('parses "25/1" (numeric day-first without year)', () => {
      expect(parseDateInput('25/1')).toBe(`${currentYear}-01-25`);
    });

    it('parses "12-31" (numeric with dash without year)', () => {
      expect(parseDateInput('12-31')).toBe(`${currentYear}-12-31`);
    });

    it('handles all months without year', () => {
      expect(parseDateInput('Feb 15')).toBe(`${currentYear}-02-15`);
      expect(parseDateInput('Dec 25')).toBe(`${currentYear}-12-25`);
    });
  });

  describe('numeric formats with heuristics', () => {
    it('detects day when first number > 12', () => {
      expect(parseDateInput('25/1/2026')).toBe('2026-01-25');
      expect(parseDateInput('31-12-2026')).toBe('2026-12-31');
    });

    it('detects day when second number > 12', () => {
      expect(parseDateInput('1/25/2026')).toBe('2026-01-25');
      expect(parseDateInput('12-31-2026')).toBe('2026-12-31');
    });

    it('returns null when both numbers > 12', () => {
      expect(parseDateInput('25/31/2026')).toBeNull();
    });

    it('validates day/month ranges', () => {
      expect(parseDateInput('0/15/2026')).toBeNull();
      expect(parseDateInput('15/0/2026')).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('returns null for empty string', () => {
      expect(parseDateInput('')).toBeNull();
    });

    it('returns null for whitespace only', () => {
      expect(parseDateInput('   ')).toBeNull();
    });

    it('trims whitespace', () => {
      expect(parseDateInput('  2026-01-25  ')).toBe('2026-01-25');
    });

    it('returns null for completely invalid strings', () => {
      expect(parseDateInput('not a date')).toBeNull();
      expect(parseDateInput('abc xyz')).toBeNull();
    });

    it('validates February dates', () => {
      expect(parseDateInput('February 29, 2024')).toBe('2024-02-29'); // Leap year
      expect(parseDateInput('February 29, 2025')).toBeNull(); // Not a leap year
      expect(parseDateInput('February 30, 2024')).toBeNull();
    });

    it('preserves years 0-99 literally instead of mapping to 1900s', () => {
      expect(parseDateInput('01/01/0050')).toBe('0050-01-01');
    });

    it('rejects mixed separators', () => {
      expect(parseDateInput('1/25.2026')).toBeNull();
    });
  });
});

describe('formatDisplayDate', () => {
  it('formats ISO date to readable format', () => {
    expect(formatDisplayDate('2026-01-25')).toBe('January 25, 2026');
  });

  it('formats single-digit dates correctly', () => {
    expect(formatDisplayDate('2026-01-05')).toBe('January 5, 2026');
  });

  it('formats all months correctly', () => {
    expect(formatDisplayDate('2026-02-15')).toBe('February 15, 2026');
    expect(formatDisplayDate('2026-12-25')).toBe('December 25, 2026');
  });
});

describe('dateToISO', () => {
  it('converts Date object to ISO string', () => {
    const date = new Date(2026, 0, 25); // January 25, 2026
    expect(dateToISO(date)).toBe('2026-01-25');
  });

  it('pads single-digit month and day', () => {
    const date = new Date(2026, 0, 5); // January 5, 2026
    expect(dateToISO(date)).toBe('2026-01-05');
  });
});

describe('parseISO', () => {
  it('parses ISO string to Date object', () => {
    const date = parseISO('2026-01-25');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(0); // January
    expect(date.getDate()).toBe(25);
  });
});
