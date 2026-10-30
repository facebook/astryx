// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file lazyMenuBottomSheet.test.ts
 * @input lazyMenuBottomSheet's action-list preload, with the list's module
 *   failing to load once
 * @output A failed preload is no unhandled rejection, and is not kept: the
 *   next load asks the module loader again
 * @position Unit test of ./lazyMenuBottomSheet; the hydration case is in
 *   DropdownMenu.ssr.test.tsx
 */

import {afterEach, describe, expect, it, vi} from 'vitest';

afterEach(() => {
  vi.doUnmock('./MenuBottomSheetActionList');
  vi.resetModules();
});

describe('preloadMenuBottomSheetActionList', () => {
  it('drops a failed preload without an unhandled rejection, and asks the module loader again on the next call', async () => {
    vi.resetModules();
    let attempts = 0;
    vi.doMock('./MenuBottomSheetActionList', () => {
      attempts += 1;
      if (attempts === 1) {
        throw new Error('the connection dropped');
      }
      return {MenuBottomSheetActionList: () => null};
    });
    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => unhandled.push(reason);
    process.on('unhandledRejection', onUnhandled);
    try {
      const {preloadMenuBottomSheetActionList} =
        await import('./lazyMenuBottomSheet');
      preloadMenuBottomSheetActionList();
      await vi.waitFor(() => expect(attempts).toBe(1));
      // An unhandled rejection is reported after the rejecting task's
      // microtasks: give it two macrotasks.
      await new Promise(resolve => setTimeout(resolve, 0));
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(unhandled).toEqual([]);

      preloadMenuBottomSheetActionList();
      await vi.waitFor(() => expect(attempts).toBe(2));
      const loaded = await import('./MenuBottomSheetActionList');
      expect(typeof loaded.MenuBottomSheetActionList).toBe('function');
    } finally {
      process.off('unhandledRejection', onUnhandled);
    }
  });
});
