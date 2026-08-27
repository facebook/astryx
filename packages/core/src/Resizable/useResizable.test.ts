// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useResizable.test.ts
 * @input Uses vitest, @testing-library/react renderHook, useResizable
 * @output Unit tests for useResizable persistence and collapse state
 * @position Testing; validates useResizable implementation
 *
 * Persistence coverage originated in #4824 by @AKnassa.
 *
 * SYNC: When useResizable changes, update tests to match new behavior
 */

import {useLayoutEffect} from 'react';
import {describe, it, expect, beforeEach, vi} from 'vitest';
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

type StoredEntry = {size: number; isCollapsed: boolean} | number | null;

function readStored(): StoredEntry {
  return JSON.parse(localStorage.getItem(KEY) ?? 'null') as StoredEntry;
}

beforeEach(() => {
  localStorage.clear();
});

describe('useResizable persistence', () => {
  it('restores a persisted width (legacy plain-number format)', () => {
    localStorage.setItem(KEY, '320');
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true}),
    );
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
    expect(readStored()).toEqual({size: 340, isCollapsed: false});
  });

  it('keeps the expanded width in storage when collapsing', () => {
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true}),
    );
    act(() => result.current.resize(300));
    act(() => result.current.collapse());

    expect(result.current.size).toBe(0);
    expect(result.current.isCollapsed).toBe(true);
    expect(readStored()).toEqual({size: 300, isCollapsed: true});
  });

  it('restores the collapsed state and the pre-collapse width on remount', () => {
    localStorage.setItem(KEY, JSON.stringify({size: 300, isCollapsed: true}));
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true}),
    );

    expect(result.current.isCollapsed).toBe(true);
    expect(result.current.size).toBe(0);

    act(() => result.current.expand());
    expect(result.current.size).toBe(300);
    expect(readStored()).toEqual({size: 300, isCollapsed: false});
  });

  it('treats a legacy persisted 0 as collapsed when collapsible', () => {
    localStorage.setItem(KEY, '0');
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true}),
    );

    expect(result.current.isCollapsed).toBe(true);
    expect(result.current.size).toBe(0);

    // The legacy entry lost the real width, so expanding falls back to the
    // default rather than to the minimum.
    act(() => result.current.expand());
    expect(result.current.size).toBe(260);
  });

  it('treats a legacy persisted 0 as the default width when not collapsible', () => {
    localStorage.setItem(KEY, '0');
    const {result} = renderHook(() => useResizable(BASE_CONFIG));
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.size).toBe(260);
  });

  it('ignores a persisted collapse flag when not collapsible', () => {
    localStorage.setItem(KEY, JSON.stringify({size: 300, isCollapsed: true}));
    const {result} = renderHook(() => useResizable(BASE_CONFIG));
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.size).toBe(300);
  });

  it('keeps the saved width across repeated collapse calls', () => {
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true}),
    );
    act(() => result.current.resize(300));
    act(() => result.current.collapse());
    act(() => result.current.collapse());

    expect(readStored()).toEqual({size: 300, isCollapsed: true});
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
    expect(readStored()).toEqual({size: 300, isCollapsed: true});

    // A continued drag below the threshold must not clobber the saved width.
    act(() => result.current.props._onResizeMove(-275));
    act(() => result.current.expand());
    expect(result.current.size).toBe(300);
  });

  it('does not touch storage without an autoSaveId', () => {
    const {result} = renderHook(() =>
      useResizable({defaultSize: 260, collapsible: true}),
    );
    act(() => result.current.collapse());
    expect(localStorage.length).toBe(0);
  });
});

describe('useResizable uncontrolled collapse', () => {
  it('starts collapsed from defaultIsCollapsed', () => {
    const {result} = renderHook(() =>
      useResizable({
        defaultSize: 260,
        collapsible: true,
        defaultIsCollapsed: true,
      }),
    );
    expect(result.current.isCollapsed).toBe(true);
    expect(result.current.size).toBe(0);

    act(() => result.current.expand());
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.size).toBe(260);
  });

  it('ignores defaultIsCollapsed when not collapsible', () => {
    const {result} = renderHook(() =>
      useResizable({defaultSize: 260, defaultIsCollapsed: true}),
    );
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.size).toBe(260);
  });

  it('lets a persisted collapse flag win over defaultIsCollapsed', () => {
    localStorage.setItem(KEY, JSON.stringify({size: 300, isCollapsed: false}));
    const {result} = renderHook(() =>
      useResizable({
        ...BASE_CONFIG,
        collapsible: true,
        defaultIsCollapsed: true,
      }),
    );
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.size).toBe(300);
  });

  it('keeps defaultIsCollapsed when a legacy width entry says nothing about collapse', () => {
    localStorage.setItem(KEY, '300');
    const {result} = renderHook(() =>
      useResizable({
        ...BASE_CONFIG,
        collapsible: true,
        defaultIsCollapsed: true,
      }),
    );
    expect(result.current.isCollapsed).toBe(true);
    // The width is still restored — it is only collapse that is unknown.
    act(() => result.current.expand());
    expect(result.current.size).toBe(300);
  });

  it('notifies onCollapseChange once per collapse and expand', () => {
    const onCollapseChange = vi.fn();
    const {result} = renderHook(() =>
      useResizable({defaultSize: 260, collapsible: true, onCollapseChange}),
    );

    act(() => result.current.collapse());
    expect(onCollapseChange).toHaveBeenCalledExactlyOnceWith(true);

    onCollapseChange.mockClear();
    act(() => result.current.expand());
    expect(onCollapseChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('collapses on a drag past the threshold', () => {
    const onCollapseChange = vi.fn();
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true, onCollapseChange}),
    );

    act(() => result.current.props._onResizeStart());
    act(() => result.current.props._onResizeMove(-240));

    expect(result.current.isCollapsed).toBe(true);
    expect(onCollapseChange).toHaveBeenCalledWith(true);
  });
});

describe('useResizable controlled collapse', () => {
  it('renders the controlled value rather than its own state', () => {
    const {result, rerender} = renderHook(
      ({isCollapsed}: {isCollapsed: boolean}) =>
        useResizable({defaultSize: 260, collapsible: true, isCollapsed}),
      {initialProps: {isCollapsed: true}},
    );

    expect(result.current.isCollapsed).toBe(true);
    expect(result.current.size).toBe(0);

    rerender({isCollapsed: false});
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.size).toBe(260);
  });

  it('makes collapse() and expand() intents that change nothing locally', () => {
    const onCollapseChange = vi.fn();
    const {result} = renderHook(() =>
      useResizable({
        defaultSize: 260,
        collapsible: true,
        isCollapsed: false,
        onCollapseChange,
      }),
    );

    act(() => result.current.collapse());
    expect(onCollapseChange).toHaveBeenCalledExactlyOnceWith(true);
    // The owner said expanded and never changed its mind.
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.size).toBe(260);
  });

  it('reports a drag past the threshold instead of collapsing itself', () => {
    const onCollapseChange = vi.fn();
    const {result} = renderHook(() =>
      useResizable({
        ...BASE_CONFIG,
        collapsible: true,
        isCollapsed: false,
        onCollapseChange,
      }),
    );

    act(() => result.current.props._onResizeStart());
    act(() => result.current.props._onResizeMove(-240));

    expect(onCollapseChange).toHaveBeenCalledWith(true);
    expect(result.current.isCollapsed).toBe(false);
  });

  it('persists the collapse state the owner holds', () => {
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true, isCollapsed: true}),
    );
    expect(result.current.isCollapsed).toBe(true);
    expect(readStored()).toEqual({size: 260, isCollapsed: true});
  });
});

// The fix under test is @AKnassa's, from #5118.
describe('useResizable live collapse state', () => {
  it('reads the current controlled value before consumer layout effects', () => {
    const onCollapseChange = vi.fn();
    const {rerender} = renderHook(
      ({isCollapsed, shouldCollapse}) => {
        const {collapse} = useResizable({
          defaultSize: 260,
          collapsible: true,
          isCollapsed,
          onCollapseChange,
        });
        useLayoutEffect(() => {
          if (shouldCollapse) {
            collapse();
          }
        }, [collapse, shouldCollapse]);
        return collapse;
      },
      {initialProps: {isCollapsed: true, shouldCollapse: false}},
    );

    rerender({isCollapsed: false, shouldCollapse: true});
    expect(onCollapseChange).toHaveBeenCalledExactlyOnceWith(true);
  });

  // ResizeHandle registers its pointermove listener once at pointer down, so
  // a whole gesture runs against the props object captured there. These tests
  // hold that snapshot instead of re-reading result.current between moves —
  // re-reading hands the callbacks a fresh render and hides the bug.
  it('reports one collapse for a drag that stays below the threshold', () => {
    const onCollapseChange = vi.fn();
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true, onCollapseChange}),
    );

    act(() => result.current.props._onResizeStart());
    const gesture = result.current.props;
    for (const delta of [-240, -245, -250, -255, -260]) {
      act(() => gesture._onResizeMove(delta));
    }

    expect(onCollapseChange).toHaveBeenCalledExactlyOnceWith(true);
    expect(result.current.isCollapsed).toBe(true);
  });

  it('re-expands mid-gesture when the drag crosses back above the threshold', () => {
    const onCollapseChange = vi.fn();
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true, onCollapseChange}),
    );

    act(() => result.current.props._onResizeStart());
    const gesture = result.current.props;
    act(() => gesture._onResizeMove(-240));
    act(() => gesture._onResizeMove(-20));

    expect(onCollapseChange.mock.calls).toEqual([[true], [false]]);
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.size).toBe(240);
  });

  it('notifies when resize() lifts the panel out of collapse', () => {
    const onCollapseChange = vi.fn();
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true, onCollapseChange}),
    );

    act(() => result.current.collapse());
    onCollapseChange.mockClear();
    act(() => result.current.resize(300));

    expect(onCollapseChange).toHaveBeenCalledExactlyOnceWith(false);
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.size).toBe(300);
  });

  it('reports one collapse when collapse() runs twice in a tick', () => {
    const onCollapseChange = vi.fn();
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true, onCollapseChange}),
    );

    act(() => {
      result.current.collapse();
      result.current.collapse();
    });

    expect(onCollapseChange).toHaveBeenCalledExactlyOnceWith(true);
  });
});
