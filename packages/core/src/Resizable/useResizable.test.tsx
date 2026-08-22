// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useResizable.test.tsx
 * @input useResizable hook
 * @output Vitest suite
 * @position Colocated tests for useResizable
 *
 * SYNC: When useResizable.ts changes, update tests to match new behavior
 *
 * The band ([minSizePx, maxSizePx]) can move under a size the viewer already
 * chose. These tests pin the asymmetry that makes that safe: the held size is
 * corrected when it falls outside the band, and left alone when the band grows
 * back — a symmetric re-clamp would rubber-band the region as a window resizes.
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {act, renderHook} from '@testing-library/react';
import {useResizable} from './useResizable';

// This jsdom setup ships no Storage implementation, so persistence needs one.
function createStorageStub(): Storage {
  const entries = new Map<string, string>();
  return {
    get length() {
      return entries.size;
    },
    clear: () => entries.clear(),
    getItem: (key: string) => entries.get(key) ?? null,
    key: (index: number) => [...entries.keys()][index] ?? null,
    removeItem: (key: string) => entries.delete(key),
    setItem: (key: string, value: string) => entries.set(key, value),
  };
}

describe('useResizable', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageStub());
  });

  describe('bounds changing under the held size', () => {
    it('clamps the held size down when maxSizePx shrinks below it', () => {
      const {result, rerender} = renderHook(
        ({max}) =>
          useResizable({defaultSize: 300, minSizePx: 100, maxSizePx: max}),
        {initialProps: {max: 400}},
      );

      expect(result.current.size).toBe(300);

      rerender({max: 200});

      expect(result.current.size).toBe(200);
    });

    it('does not restore or expand when maxSizePx grows again', () => {
      const {result, rerender} = renderHook(
        ({max}) =>
          useResizable({defaultSize: 300, minSizePx: 100, maxSizePx: max}),
        {initialProps: {max: 400}},
      );

      rerender({max: 200});
      rerender({max: 400});

      // The ceiling moved, not the viewer's choice: 200 is the size now.
      expect(result.current.size).toBe(200);
    });

    it('leaves a still-legal size untouched when maxSizePx shrinks', () => {
      const onSizeChange = vi.fn();
      const {result, rerender} = renderHook(
        ({max}) =>
          useResizable({
            defaultSize: 150,
            minSizePx: 100,
            maxSizePx: max,
            onSizeChange,
          }),
        {initialProps: {max: 400}},
      );

      rerender({max: 200});

      expect(result.current.size).toBe(150);
      expect(onSizeChange).not.toHaveBeenCalled();
    });

    it('grows the held size when minSizePx rises above it', () => {
      const {result, rerender} = renderHook(
        ({min}) =>
          useResizable({defaultSize: 150, minSizePx: min, maxSizePx: 400}),
        {initialProps: {min: 100}},
      );

      rerender({min: 250});

      expect(result.current.size).toBe(250);
    });

    it('reports the involuntary clamp through onSizeChange', () => {
      const onSizeChange = vi.fn();
      const {rerender} = renderHook(
        ({max}) =>
          useResizable({
            defaultSize: 300,
            minSizePx: 100,
            maxSizePx: max,
            onSizeChange,
          }),
        {initialProps: {max: 400}},
      );

      rerender({max: 200});

      expect(onSizeChange).toHaveBeenCalledTimes(1);
      expect(onSizeChange).toHaveBeenCalledWith(200);
    });

    it('lands on a legal snap point when snaps are configured', () => {
      const snaps = [100, 300, 500];
      const {result, rerender} = renderHook(
        ({max}) =>
          useResizable({
            defaultSize: 500,
            minSizePx: 100,
            maxSizePx: max,
            snaps,
          }),
        {initialProps: {max: 600}},
      );

      expect(result.current.size).toBe(500);

      rerender({max: 400});

      expect(result.current.size).toBe(300);
    });

    it('holds a collapsed region at zero and clamps on expand instead', () => {
      const {result, rerender} = renderHook(
        ({max}) =>
          useResizable({
            defaultSize: 300,
            minSizePx: 100,
            maxSizePx: max,
            collapsible: true,
          }),
        {initialProps: {max: 400}},
      );

      act(() => result.current.collapse());
      rerender({max: 200});

      expect(result.current.size).toBe(0);
      expect(result.current.isCollapsed).toBe(true);

      act(() => result.current.expand());

      expect(result.current.size).toBe(200);
    });

    it('persists the clamped size under autoSaveId', () => {
      const {rerender} = renderHook(
        ({max}) =>
          useResizable({
            defaultSize: 300,
            minSizePx: 100,
            maxSizePx: max,
            autoSaveId: 'panel',
          }),
        {initialProps: {max: 400}},
      );

      rerender({max: 200});

      expect(window.localStorage.getItem('astryx-resizable:panel')).toBe('200');
    });

    it('clamps each region of a multi-region config', () => {
      const {result, rerender} = renderHook(
        ({max}) =>
          useResizable({
            regions: {
              start: {defaultSize: 300, minSizePx: 100, maxSizePx: max},
              end: {defaultSize: 150, minSizePx: 100, maxSizePx: max},
            },
          }),
        {initialProps: {max: 400}},
      );

      rerender({max: 200});

      expect(result.current.start.size).toBe(200);
      expect(result.current.end.size).toBe(150);
    });
  });
});
