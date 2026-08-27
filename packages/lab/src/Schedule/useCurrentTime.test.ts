// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useCurrentTime.test.ts
 * @input Uses vitest, @testing-library/react, useCurrentTime hook
 * @output Unit tests for useCurrentTime clock snapshots
 * @position Testing; validates useCurrentTime.ts
 *
 * SYNC: When useCurrentTime.ts changes, update tests to match new behavior
 */

import {describe, it, expect, afterEach, vi} from 'vitest';
import {renderHook} from '@testing-library/react';

// The store is module-level, so each test needs its own copy of the module.
// Set the system time first: the module captures it at evaluation.
async function importHookAt(moduleLoadTime: string) {
  vi.setSystemTime(moduleLoadTime);
  vi.resetModules();
  const {useCurrentTime} = await import('./useCurrentTime');
  return useCurrentTime;
}

describe('useCurrentTime', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('reads the clock when the first subscriber mounts', async () => {
    vi.useFakeTimers({toFake: ['Date']});
    const useCurrentTime = await importHookAt('2026-01-01T09:00:00Z');
    vi.setSystemTime('2026-01-02T09:00:00Z');

    const {result} = renderHook(() => useCurrentTime());

    expect(result.current).toBe(Date.now());
  });

  it('re-reads the clock after the last subscriber unmounts', async () => {
    vi.useFakeTimers({toFake: ['Date']});
    const useCurrentTime = await importHookAt('2026-01-01T09:00:00Z');
    renderHook(() => useCurrentTime()).unmount();
    vi.setSystemTime('2026-01-01T17:00:00Z');

    const {result} = renderHook(() => useCurrentTime());

    expect(result.current).toBe(Date.now());
  });
});
