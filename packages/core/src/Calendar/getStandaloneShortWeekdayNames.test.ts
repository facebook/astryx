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

  it('returns an exact generated locale entry', () => {
    expect(getStandaloneShortWeekdayNames('ar-SA')).toBe(
      standaloneShortWeekdayNamesByLocale['ar-SA'],
    );
  });

  it('ignores Unicode extensions when resolving an exact locale', () => {
    const expected = standaloneShortWeekdayNamesByLocale['zh-TW'];

    expect(getStandaloneShortWeekdayNames('zh-TW')).toBe(expected);
    expect(getStandaloneShortWeekdayNames('zh-TW-u-ca-chinese')).toBe(expected);
  });

  it('falls back from a regional locale to its base language', () => {
    expect(getStandaloneShortWeekdayNames('es-ES')).toBe(
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
