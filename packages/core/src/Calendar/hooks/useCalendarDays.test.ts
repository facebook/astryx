// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {renderHook} from '@testing-library/react';
import {useCalendarDays} from './useCalendarDays';

describe('useCalendarDays', () => {
  it('generates correct number of days for a month', () => {
    const {result} = renderHook(() => useCalendarDays({year: 2026, month: 6}));

    // June 2026: 30 days, fixed 6 rows = 42 cells
    expect(result.current.totalCells).toBe(42);
    expect(result.current.weeks).toHaveLength(6);
  });

  it('marks outside days correctly', () => {
    const {result} = renderHook(() => useCalendarDays({year: 2026, month: 6}));

    const juneDays = result.current.days.filter(d => !d.isOutside);
    expect(juneDays).toHaveLength(30);

    // First day of June 2026 is Monday; with Sunday start, day 0 is outside
    expect(result.current.days[0].isOutside).toBe(true);
  });

  it('respects weekStartsOn', () => {
    const {result} = renderHook(() =>
      useCalendarDays({year: 2026, month: 6, weekStartsOn: 1}),
    );

    // Monday start
    expect(result.current.dayNames[0]).toBe('Mo');
    expect(result.current.dayNames[6]).toBe('Su');
  });

  it('uses variable row count when enabled', () => {
    // February 2026 starts on Sunday with weekStartsOn=0 → exactly 4 weeks
    const {result} = renderHook(() =>
      useCalendarDays({
        year: 2026,
        month: 2,
        weekStartsOn: 0,
        hasVariableRowCount: true,
      }),
    );

    // Feb 2026: 28 days, starts on Sunday → 4 rows exactly
    const weeksNeeded = Math.ceil(
      (28 + result.current.days.findIndex(d => !d.isOutside)) / 7,
    );
    expect(result.current.weeks.length).toBe(weeksNeeded);
  });

  it('generates correct day numbers', () => {
    const {result} = renderHook(() => useCalendarDays({year: 2026, month: 1}));

    const janDays = result.current.days.filter(d => !d.isOutside);
    expect(janDays[0].dayNumber).toBe(1);
    expect(janDays[30].dayNumber).toBe(31);
  });

  it('produces valid ISO strings', () => {
    const {result} = renderHook(() => useCalendarDays({year: 2026, month: 3}));

    const marchDays = result.current.days.filter(d => !d.isOutside);
    expect(marchDays[0].iso).toBe('2026-03-01');
    expect(marchDays[30].iso).toBe('2026-03-31');
  });
});
