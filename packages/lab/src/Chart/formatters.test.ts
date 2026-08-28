// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {currency, monthYear, shortDate} from './formatters';

describe('Chart date formatters', () => {
  const date = new Date(2026, 7, 22, 12);

  it('formats dates with the requested locale and Gregorian calendar', () => {
    expect(shortDate(date, 'fr-FR')).toBe(
      new Intl.DateTimeFormat('fr-FR', {
        month: 'short',
        day: 'numeric',
        calendar: 'gregory',
      }).format(date),
    );
    expect(monthYear(date, 'th-TH')).toBe(
      new Intl.DateTimeFormat('th-TH', {
        month: 'short',
        year: 'numeric',
        calendar: 'gregory',
      }).format(date),
    );
  });

  it('uses an explicit locale for unabridged currency values', () => {
    expect(currency('€', 'de-DE')(12.5)).toBe(
      `€${(12.5).toLocaleString('de-DE')}`,
    );
    expect(currency('€')(12.5)).toBe(`€${(12.5).toLocaleString('en')}`);
  });

  it('defaults to deterministic English Gregorian output', () => {
    expect(shortDate(date)).toBe(
      new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        calendar: 'gregory',
      }).format(date),
    );
    expect(monthYear(date)).toBe(
      new Intl.DateTimeFormat('en', {
        month: 'short',
        year: 'numeric',
        calendar: 'gregory',
      }).format(date),
    );
  });
});
