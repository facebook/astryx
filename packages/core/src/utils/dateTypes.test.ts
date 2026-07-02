// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dateTypes.test.ts
 * @input Uses vitest
 * @output Test suite for date type helpers
 * @position Tests for dateTypes.ts (normalizeDayOfWeek)
 *
 * SYNC: When dateTypes.ts changes, update tests accordingly
 */

import {describe, it, expect} from 'vitest';
import {normalizeDayOfWeek} from './dateTypes';

describe('normalizeDayOfWeek', () => {
  it('passes numeric days through unchanged', () => {
    expect(normalizeDayOfWeek(0)).toBe(0);
    expect(normalizeDayOfWeek(1)).toBe(1);
    expect(normalizeDayOfWeek(6)).toBe(6);
  });

  it('maps three-letter day names to their index', () => {
    expect(normalizeDayOfWeek('sun')).toBe(0);
    expect(normalizeDayOfWeek('mon')).toBe(1);
    expect(normalizeDayOfWeek('tue')).toBe(2);
    expect(normalizeDayOfWeek('wed')).toBe(3);
    expect(normalizeDayOfWeek('thu')).toBe(4);
    expect(normalizeDayOfWeek('fri')).toBe(5);
    expect(normalizeDayOfWeek('sat')).toBe(6);
  });

  it('is case-insensitive for day names', () => {
    expect(normalizeDayOfWeek('MON' as 'mon')).toBe(1);
    expect(normalizeDayOfWeek('Sat' as 'sat')).toBe(6);
  });

  it('falls back to 0 (Sunday) for an unrecognized name', () => {
    expect(normalizeDayOfWeek('xyz' as 'mon')).toBe(0);
  });
});
