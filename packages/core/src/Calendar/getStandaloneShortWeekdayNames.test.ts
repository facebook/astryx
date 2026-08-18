// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file getStandaloneShortWeekdayNames.test.ts
 * @input Private Calendar weekday locale resolver and generated CLDR data
 * @output Regression coverage for exact, language, extension, and safe fallback
 * @position Tests for getStandaloneShortWeekdayNames.ts
 */

import {describe, expect, it} from 'vitest';
import {getStandaloneShortWeekdayNames} from './getStandaloneShortWeekdayNames';
import {standaloneShortWeekdayNamesByLocale} from './standaloneShortWeekdayNames.generated';

const SUNDAY_ANCHORS = [7, 1, 2, 3, 4, 5, 6];

describe('getStandaloneShortWeekdayNames', () => {
  it('preserves the default English weekday names', () => {
    expect(getStandaloneShortWeekdayNames('en')).toEqual([
      'Su',
      'Mo',
      'Tu',
      'We',
      'Th',
      'Fr',
      'Sa',
    ]);
  });

  it('returns Spanish CLDR stand-alone-short names', () => {
    expect(getStandaloneShortWeekdayNames('es-ES')).toEqual([
      'DO',
      'LU',
      'MA',
      'MI',
      'JU',
      'VI',
      'SA',
    ]);
  });

  it('uses compact Arabic CLDR data rather than Intl abbreviated weekdays', () => {
    const generated = getStandaloneShortWeekdayNames('ar-SA');
    const browserAbbreviated = SUNDAY_ANCHORS.map(day =>
      new Intl.DateTimeFormat('ar-SA', {
        weekday: 'short',
        timeZone: 'UTC',
      }).format(new Date(Date.UTC(2024, 0, day))),
    );

    expect(generated).toEqual([
      'أحد',
      'إثنين',
      'ثلاثاء',
      'أربعاء',
      'خميس',
      'جمعة',
      'سبت',
    ]);
    expect(generated).not.toEqual(browserAbbreviated);
    expect(browserAbbreviated[0]).toBe('الأحد');
  });

  it('prefers an exact locale and ignores Unicode extensions', () => {
    expect(getStandaloneShortWeekdayNames('zh-TW')).toEqual([
      '日',
      '一',
      '二',
      '三',
      '四',
      '五',
      '六',
    ]);
    expect(getStandaloneShortWeekdayNames('zh-TW')).toBe(
      standaloneShortWeekdayNamesByLocale['zh-TW'],
    );
    expect(getStandaloneShortWeekdayNames('zh-TW-u-ca-chinese')).toBe(
      standaloneShortWeekdayNamesByLocale['zh-TW'],
    );
  });

  it('falls back from an unsupported region to its base language', () => {
    expect(getStandaloneShortWeekdayNames('es-MX')).toBe(
      standaloneShortWeekdayNamesByLocale.es,
    );
  });

  it('safely falls back to English for malformed and unsupported locales', () => {
    expect(getStandaloneShortWeekdayNames('not_a_locale')).toBe(
      standaloneShortWeekdayNamesByLocale.en,
    );
    expect(getStandaloneShortWeekdayNames('xx-ZZ')).toBe(
      standaloneShortWeekdayNamesByLocale.en,
    );
  });
});
