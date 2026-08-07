// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useScrollLock.test.ts
 * @input Uses vitest, @testing-library/react, useScrollLock hook
 * @output Unit tests for concurrent useScrollLock instances
 * @position Testing; validates useScrollLock.ts implementation
 *
 * SYNC: When useScrollLock.ts changes, update tests to match new behavior
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import {cleanup, renderHook} from '@testing-library/react';
import {useScrollLock} from './useScrollLock';

describe('useScrollLock — concurrent instances', () => {
  afterEach(() => {
    cleanup();
    document.body.style.cssText = '';
    vi.restoreAllMocks();
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
