// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useScrollLock.test.ts
 * @input Uses vitest, @testing-library/react, useScrollLock hook
 * @output Unit tests for single and concurrent useScrollLock instances
 * @position Testing; validates useScrollLock.ts implementation
 *
 * SYNC: When useScrollLock.ts changes, update tests to match new behavior
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import {cleanup, renderHook} from '@testing-library/react';
import {useScrollLock} from './useScrollLock';

describe('useScrollLock', () => {
  afterEach(() => {
    cleanup();
    document.body.style.cssText = '';
    vi.restoreAllMocks();
  });

  it('restores body styles and scroll position after a single lock is released', () => {
    document.body.style.overflow = 'auto';
    document.body.style.position = 'relative';

    vi.spyOn(window, 'scrollX', 'get').mockReturnValue(120);
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(480);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    const lock = renderHook(() => useScrollLock(true));

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.position).toBe('fixed');

    lock.unmount();

    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.style.position).toBe('relative');
    expect(window.scrollTo).toHaveBeenCalledWith(120, 480);
  });

  it('stays locked while a second overlay is still open, even if the first closes out of order', () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    const first = renderHook(() => useScrollLock(true));
    const second = renderHook(() => useScrollLock(true));

    first.unmount();

    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.overflow).toBe('hidden');

    second.unmount();
  });

  it('fully restores the body once every overlay has closed, regardless of close order', () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    const first = renderHook(() => useScrollLock(true));
    const second = renderHook(() => useScrollLock(true));

    first.unmount();
    second.unmount();

    expect(document.body.style.position).toBe('');
    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.top).toBe('');
    expect(document.body.style.left).toBe('');
    expect(document.body.style.right).toBe('');
  });
});
