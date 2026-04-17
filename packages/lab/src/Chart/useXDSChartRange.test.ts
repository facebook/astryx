import {describe, it, expect} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useXDSChartRange} from './useXDSChartRange';

describe('useXDSChartRange', () => {
  it('initializes with zero domain', () => {
    const {result} = renderHook(() => useXDSChartRange({xWindow: 300}));
    expect(result.current.xDomain).toEqual([0, 0]);
    expect(result.current.yDomain).toEqual([0, 1]);
  });

  it('uses fixed yDomain when provided', () => {
    const {result} = renderHook(() =>
      useXDSChartRange({xWindow: 300, yDomain: [0, 100]}),
    );
    expect(result.current.yDomain).toEqual([0, 100]);
  });

  it('grows xDomain during warmup then slides', () => {
    const {result} = renderHook(() => useXDSChartRange({xWindow: 100}));

    // During warmup: [0, x]
    act(() => {
      result.current.push(50, 10);
    });
    expect(result.current.xDomain).toEqual([0, 50]);

    // Still warmup
    act(() => {
      result.current.push(80, 20);
    });
    expect(result.current.xDomain).toEqual([0, 80]);

    // Full window: slides
    act(() => {
      result.current.push(150, 20);
    });
    expect(result.current.xDomain).toEqual([50, 150]);
  });

  it('auto-tracks y range with padding', () => {
    const {result} = renderHook(() =>
      useXDSChartRange({xWindow: 100, yPadding: 0.1}),
    );

    act(() => {
      result.current.push(1, 50);
    });
    // Single point: range=1 (fallback), pad=0.1
    expect(result.current.yDomain[0]).toBeLessThan(50);
    expect(result.current.yDomain[1]).toBeGreaterThan(50);

    act(() => {
      result.current.push(2, 100);
    });
    // Range 50-100, padding 10% = 5
    expect(result.current.yDomain[0]).toBeCloseTo(45, 0);
    expect(result.current.yDomain[1]).toBeCloseTo(105, 0);
  });

  it('does not auto-track y when fixed yDomain is set', () => {
    const {result} = renderHook(() =>
      useXDSChartRange({xWindow: 100, yDomain: [0, 100]}),
    );

    act(() => {
      result.current.push(1, 200);
    });
    expect(result.current.yDomain).toEqual([0, 100]);
  });

  it('centers y around zero when yCenter is true', () => {
    const {result} = renderHook(() =>
      useXDSChartRange({xWindow: 100, yCenter: true, yPadding: 0}),
    );

    act(() => {
      result.current.push(1, -30);
      result.current.push(2, 10);
    });
    expect(result.current.yDomain[0]).toBe(-30);
    expect(result.current.yDomain[1]).toBe(30);
  });

  it('resets state', () => {
    const {result} = renderHook(() => useXDSChartRange({xWindow: 200}));

    act(() => {
      result.current.push(500, 99);
    });
    expect(result.current.xDomain[1]).toBe(500);

    act(() => {
      result.current.reset();
    });
    expect(result.current.xDomain).toEqual([0, 0]);
    expect(result.current.yDomain).toEqual([0, 1]);
  });
});
