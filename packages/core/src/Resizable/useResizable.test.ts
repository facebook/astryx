// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useResizable.test.ts
 * @input Uses vitest, @testing-library/react renderHook, useResizable
 * @output Unit tests for useResizable persistence and collapse behavior
 * @position Testing; validates useResizable implementation
 *
 * SYNC: When useResizable changes, update tests to match new behavior
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useResizable} from './useResizable';

const AUTO_SAVE_ID = 'test-panel';
const KEY = `astryx-resizable:${AUTO_SAVE_ID}`;

const BASE_CONFIG = {
  defaultSize: 260,
  minSizePx: 180,
  maxSizePx: 480,
  autoSaveId: AUTO_SAVE_ID,
};

beforeEach(() => {
  localStorage.clear();
});

describe('useResizable persistence', () => {
  it('restores a persisted width (plain-number format)', () => {
    localStorage.setItem(KEY, '320');
    const {result} = renderHook(() => useResizable(BASE_CONFIG));
    expect(result.current.size).toBe(320);
    expect(result.current.isCollapsed).toBe(false);
  });

  it('clamps a persisted width below the minimum', () => {
    localStorage.setItem(KEY, '20');
    const {result} = renderHook(() => useResizable(BASE_CONFIG));
    expect(result.current.size).toBe(180);
  });

  it('ignores a non-finite persisted value', () => {
    // JSON.parse('1e999') yields Infinity, which passes a typeof check.
    localStorage.setItem(KEY, '1e999');
    const {result} = renderHook(() => useResizable(BASE_CONFIG));
    expect(result.current.size).toBe(260);
  });

  it('ignores corrupt storage content', () => {
    localStorage.setItem(KEY, 'not json');
    const {result} = renderHook(() => useResizable(BASE_CONFIG));
    expect(result.current.size).toBe(260);
  });

  it('persists the expanded size together with the collapse flag', () => {
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true}),
    );
    act(() => result.current.resize(340));
    expect(JSON.parse(localStorage.getItem(KEY) ?? 'null')).toEqual({
      size: 340,
      isCollapsed: false,
    });
  });

  it('keeps the expanded width in storage when collapsing', () => {
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true}),
    );
    act(() => result.current.resize(300));
    act(() => result.current.collapse());

    expect(result.current.size).toBe(0);
    expect(result.current.isCollapsed).toBe(true);
    expect(JSON.parse(localStorage.getItem(KEY) ?? 'null')).toEqual({
      size: 300,
      isCollapsed: true,
    });
  });

  it('restores the collapsed state and pre-collapse width on remount', () => {
    localStorage.setItem(KEY, JSON.stringify({size: 300, isCollapsed: true}));
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true}),
    );

    expect(result.current.isCollapsed).toBe(true);
    expect(result.current.size).toBe(0);

    act(() => result.current.expand());
    expect(result.current.size).toBe(300);
    expect(JSON.parse(localStorage.getItem(KEY) ?? 'null')).toEqual({
      size: 300,
      isCollapsed: false,
    });
  });

  it('treats a legacy persisted 0 as collapsed when collapsible', () => {
    localStorage.setItem(KEY, '0');
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true}),
    );

    expect(result.current.isCollapsed).toBe(true);
    expect(result.current.size).toBe(0);

    // The legacy entry lost the real width — expand to the default, not the min.
    act(() => result.current.expand());
    expect(result.current.size).toBe(260);
  });

  it('treats a legacy persisted 0 as the default width when not collapsible', () => {
    localStorage.setItem(KEY, '0');
    const {result} = renderHook(() => useResizable(BASE_CONFIG));
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.size).toBe(260);
  });

  it('ignores a persisted collapsed flag when not collapsible', () => {
    localStorage.setItem(KEY, JSON.stringify({size: 300, isCollapsed: true}));
    const {result} = renderHook(() => useResizable(BASE_CONFIG));
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.size).toBe(300);
  });

  it('does not clobber the saved width when collapse is called twice', () => {
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true}),
    );
    act(() => result.current.resize(300));
    act(() => result.current.collapse());
    act(() => result.current.collapse());

    expect(JSON.parse(localStorage.getItem(KEY) ?? 'null')).toEqual({
      size: 300,
      isCollapsed: true,
    });
    act(() => result.current.expand());
    expect(result.current.size).toBe(300);
  });

  it('persists the pre-drag width when dragging to collapse', () => {
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true}),
    );
    act(() => result.current.resize(300));
    act(() => result.current.props._onResizeStart());
    act(() => result.current.props._onResizeMove(-270));

    expect(result.current.isCollapsed).toBe(true);
    expect(JSON.parse(localStorage.getItem(KEY) ?? 'null')).toEqual({
      size: 300,
      isCollapsed: true,
    });

    // A continued drag below the threshold must not clobber the saved width.
    act(() => result.current.props._onResizeMove(-275));
    act(() => result.current.expand());
    expect(result.current.size).toBe(300);
  });

  it('lets initialIsCollapsed override a persisted collapse flag', () => {
    localStorage.setItem(KEY, JSON.stringify({size: 300, isCollapsed: true}));
    const {result} = renderHook(() =>
      useResizable({
        ...BASE_CONFIG,
        collapsible: true,
        initialIsCollapsed: false,
      }),
    );
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.size).toBe(300);
  });

  it('collapses at mount and persists when initialIsCollapsed is true', () => {
    const {result} = renderHook(() =>
      useResizable({
        ...BASE_CONFIG,
        collapsible: true,
        initialIsCollapsed: true,
      }),
    );
    expect(result.current.isCollapsed).toBe(true);
    expect(JSON.parse(localStorage.getItem(KEY) ?? 'null')).toEqual({
      size: 260,
      isCollapsed: true,
    });
    act(() => result.current.expand());
    expect(result.current.size).toBe(260);
  });
});
