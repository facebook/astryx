// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {renderHook} from '@testing-library/react';
import {useCalendarConstraints} from './useCalendarConstraints';

describe('useCalendarConstraints', () => {
  it('disables dates before min', () => {
    const {result} = renderHook(() =>
      useCalendarConstraints({min: '2026-06-10'}),
    );

    expect(result.current.isDateDisabled({year: 2026, month: 6, day: 9})).toBe(
      true,
    );
    expect(result.current.isDateDisabled({year: 2026, month: 6, day: 10})).toBe(
      false,
    );
    expect(result.current.isDateDisabled({year: 2026, month: 6, day: 11})).toBe(
      false,
    );
  });

  it('disables dates after max', () => {
    const {result} = renderHook(() =>
      useCalendarConstraints({max: '2026-06-20'}),
    );

    expect(result.current.isDateDisabled({year: 2026, month: 6, day: 20})).toBe(
      false,
    );
    expect(result.current.isDateDisabled({year: 2026, month: 6, day: 21})).toBe(
      true,
    );
  });

  it('applies custom constraint functions', () => {
    // No weekends
    const noWeekends = (date: Date) => {
      const day = date.getDay();
      return day !== 0 && day !== 6;
    };

    const {result} = renderHook(() =>
      useCalendarConstraints({dateConstraints: [noWeekends]}),
    );

    // June 14, 2026 is a Sunday
    expect(result.current.isDateDisabled({year: 2026, month: 6, day: 14})).toBe(
      true,
    );
    // June 15, 2026 is a Monday
    expect(result.current.isDateDisabled({year: 2026, month: 6, day: 15})).toBe(
      false,
    );
  });

  it('combines min, max, and custom constraints', () => {
    const noWeekends = (date: Date) =>
      date.getDay() !== 0 && date.getDay() !== 6;

    const {result} = renderHook(() =>
      useCalendarConstraints({
        min: '2026-06-05',
        max: '2026-06-25',
        dateConstraints: [noWeekends],
      }),
    );

    // Before min
    expect(result.current.isDateDisabled({year: 2026, month: 6, day: 4})).toBe(
      true,
    );
    // After max
    expect(result.current.isDateDisabled({year: 2026, month: 6, day: 26})).toBe(
      true,
    );
    // Weekend in range
    expect(result.current.isDateDisabled({year: 2026, month: 6, day: 14})).toBe(
      true,
    );
    // Weekday in range
    expect(result.current.isDateDisabled({year: 2026, month: 6, day: 15})).toBe(
      false,
    );
  });

  it('allows all dates when no constraints', () => {
    const {result} = renderHook(() => useCalendarConstraints({}));

    expect(result.current.isDateDisabled({year: 2020, month: 1, day: 1})).toBe(
      false,
    );
    expect(
      result.current.isDateDisabled({year: 2030, month: 12, day: 31}),
    ).toBe(false);
  });
});
