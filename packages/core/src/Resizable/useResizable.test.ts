// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useResizable.test.ts
 * @input Uses vitest, @testing-library/react renderHook, useResizable
 * @output Unit tests for useResizable persistence and collapse behavior
 * @position Testing; validates useResizable implementation
 *
 * SYNC: When useResizable changes, update tests to match new behavior
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useResizable, loadPersistedState} from './useResizable';

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
    const onCollapseChange = vi.fn();
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true, onCollapseChange}),
    );
    act(() => result.current.resize(300));
    act(() => result.current.collapse());
    act(() => result.current.collapse());

    expect(JSON.parse(localStorage.getItem(KEY) ?? 'null')).toEqual({
      size: 300,
      isCollapsed: true,
    });
    // The second call is inert, so it must not re-notify either.
    expect(onCollapseChange).toHaveBeenCalledTimes(1);
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

  it('does not honor initialIsCollapsed when not collapsible', () => {
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, initialIsCollapsed: true}),
    );
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.size).toBe(260);
  });

  it('resize() while collapsed un-collapses and persists the new width', () => {
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true}),
    );
    act(() => result.current.resize(300));
    act(() => result.current.collapse());
    act(() => result.current.resize(320));

    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.size).toBe(320);
    expect(JSON.parse(localStorage.getItem(KEY) ?? 'null')).toEqual({
      size: 320,
      isCollapsed: false,
    });
  });

  it('resize() out of the collapsed state notifies onCollapseChange(false)', () => {
    const onCollapseChange = vi.fn();
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true, onCollapseChange}),
    );
    act(() => result.current.collapse());
    onCollapseChange.mockClear();

    act(() => result.current.resize(320));
    expect(onCollapseChange).toHaveBeenCalledTimes(1);
    expect(onCollapseChange).toHaveBeenCalledWith(false);
  });

  it('does not notify onCollapseChange when resizing an already expanded region', () => {
    const onCollapseChange = vi.fn();
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true, onCollapseChange}),
    );
    act(() => result.current.resize(300));
    act(() => result.current.resize(320));
    expect(onCollapseChange).not.toHaveBeenCalled();
  });

  it('fires onCollapseChange once for a drag that keeps moving below the threshold', () => {
    const onCollapseChange = vi.fn();
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true, onCollapseChange}),
    );
    act(() => result.current.resize(300));
    onCollapseChange.mockClear();

    act(() => result.current.props._onResizeStart());
    act(() => result.current.props._onResizeMove(-270));
    act(() => result.current.props._onResizeMove(-272));

    expect(result.current.isCollapsed).toBe(true);
    expect(onCollapseChange).toHaveBeenCalledTimes(1);
    expect(onCollapseChange).toHaveBeenCalledWith(true);
  });

  it('notifies once when expand and resize run in the same tick', () => {
    const onCollapseChange = vi.fn();
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true, onCollapseChange}),
    );
    act(() => result.current.collapse());
    onCollapseChange.mockClear();

    act(() => {
      result.current.expand();
      result.current.resize(280);
    });

    expect(onCollapseChange).toHaveBeenCalledTimes(1);
    expect(onCollapseChange).toHaveBeenCalledWith(false);
    expect(result.current.isCollapsed).toBe(false);
  });

  it('reports the final state when collapse and resize run in the same tick', () => {
    const onCollapseChange = vi.fn();
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true, onCollapseChange}),
    );
    act(() => result.current.resize(300));
    onCollapseChange.mockClear();

    act(() => {
      result.current.collapse();
      result.current.resize(280);
    });

    // The region ends expanded, so the consumer must not be left believing
    // it collapsed.
    expect(result.current.isCollapsed).toBe(false);
    expect(onCollapseChange.mock.calls).toEqual([[true], [false]]);
  });

  it('handles a whole drag gesture through the props captured at pointer down', () => {
    const onCollapseChange = vi.fn();
    const {result} = renderHook(() =>
      useResizable({
        ...BASE_CONFIG,
        collapsible: true,
        collapsedSize: 160,
        onCollapseChange,
      }),
    );
    act(() => result.current.resize(300));
    onCollapseChange.mockClear();

    // ResizeHandle registers its pointermove listener once at pointer down,
    // so the entire gesture runs against this one props object.
    const gesture = result.current.props;
    act(() => gesture._onResizeStart());
    act(() => gesture._onResizeMove(-200));
    act(() => gesture._onResizeMove(-210));

    expect(result.current.isCollapsed).toBe(true);
    expect(onCollapseChange).toHaveBeenCalledTimes(1);

    // Dragging back above the threshold in the same gesture re-expands.
    act(() => gesture._onResizeMove(50));
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.size).toBe(350);
    expect(onCollapseChange.mock.calls).toEqual([[true], [false]]);
  });

  it('keeps the restore width when a drag from collapsed crosses out and back', () => {
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true, collapsedSize: 160}),
    );
    act(() => result.current.resize(300));
    act(() => result.current.collapse());

    // One gesture: start on the collapsed rail, pull out past the
    // threshold, then push back under it.
    const gesture = result.current.props;
    act(() => gesture._onResizeStart());
    act(() => gesture._onResizeMove(200));
    act(() => gesture._onResizeMove(100));

    expect(result.current.isCollapsed).toBe(true);
    // The width saved before the original collapse survives the round
    // trip — the gesture began at 0, and 0 must never become the width
    // expand() restores (#4790).
    expect(JSON.parse(localStorage.getItem(KEY) ?? 'null')).toEqual({
      size: 300,
      isCollapsed: true,
    });
    act(() => result.current.expand());
    expect(result.current.size).toBe(300);
  });

  it('treats an explicit regions: undefined as a single-region config', () => {
    const {result} = renderHook(() =>
      useResizable({
        defaultSize: 240,
        autoSaveId: AUTO_SAVE_ID,
        regions: undefined,
      }),
    );
    expect(result.current.size).toBe(240);
    expect(result.current.isCollapsed).toBe(false);
  });
});

// =============================================================================
// Hostile storage
// =============================================================================

describe('useResizable hostile storage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('keeps working in memory when localStorage.setItem throws (quota)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true}),
    );
    act(() => result.current.resize(300));
    act(() => result.current.collapse());
    act(() => result.current.expand());
    expect(result.current.size).toBe(300);
  });

  it('falls back to the default size when localStorage.getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    const {result} = renderHook(() => useResizable(BASE_CONFIG));
    expect(result.current.size).toBe(260);
  });

  it('loadPersistedState returns null when window is undefined (SSR guard)', () => {
    vi.stubGlobal('window', undefined);
    expect(loadPersistedState(AUTO_SAVE_ID)).toBeNull();
  });

  it('salvages the collapse flag from an object entry with size 0', () => {
    localStorage.setItem(KEY, JSON.stringify({size: 0, isCollapsed: true}));
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true}),
    );
    // Mirrors the legacy plain-0 mapping: collapsed, no saved size.
    expect(result.current.isCollapsed).toBe(true);
    expect(result.current.size).toBe(0);
    act(() => result.current.expand());
    expect(result.current.size).toBe(260);
  });

  it('salvages the collapse flag from an object entry with a negative size', () => {
    localStorage.setItem(KEY, JSON.stringify({size: -5, isCollapsed: true}));
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true}),
    );
    expect(result.current.isCollapsed).toBe(true);
    act(() => result.current.expand());
    expect(result.current.size).toBe(260);
  });

  it('salvages the collapse flag from an object entry missing size', () => {
    localStorage.setItem(KEY, JSON.stringify({isCollapsed: true}));
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true}),
    );
    expect(result.current.isCollapsed).toBe(true);
    act(() => result.current.expand());
    expect(result.current.size).toBe(260);
  });

  it('treats a non-boolean isCollapsed as expanded but keeps the valid size', () => {
    localStorage.setItem(KEY, JSON.stringify({size: 300, isCollapsed: 'yes'}));
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, collapsible: true}),
    );
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.size).toBe(300);
  });

  it('falls back to the default for wrong-typed JSON payloads', () => {
    for (const raw of ['[300]', 'null', 'true', '"320"']) {
      localStorage.setItem(KEY, raw);
      const {result, unmount} = renderHook(() => useResizable(BASE_CONFIG));
      expect(result.current.size).toBe(260);
      expect(result.current.isCollapsed).toBe(false);
      unmount();
      localStorage.clear();
    }
  });

  it('clamps a legacy negative number entry to the minimum width', () => {
    localStorage.setItem(KEY, '-50');
    const {result} = renderHook(() => useResizable(BASE_CONFIG));
    // Legacy numbers follow the established clamp-to-min policy ('20' → min).
    expect(result.current.size).toBe(180);
    expect(result.current.isCollapsed).toBe(false);
  });
});

// =============================================================================
// Multi-region persistence
// =============================================================================

const MULTI_CONFIG = {
  regions: {
    left: {defaultSize: 260, minSizePx: 100, maxSizePx: 600, collapsible: true},
    right: {defaultSize: 300, minSizePx: 100, maxSizePx: 600},
  },
  autoSaveId: 'layout',
};
const LEFT_KEY = 'astryx-resizable:layout:left';
const RIGHT_KEY = 'astryx-resizable:layout:right';

describe('useResizable multi-region persistence', () => {
  it('collapsing one region writes only its own suffixed entry', () => {
    const {result} = renderHook(() => useResizable(MULTI_CONFIG));
    act(() => result.current.left.collapse());

    expect(result.current.left.isCollapsed).toBe(true);
    expect(result.current.left.size).toBe(0);
    expect(result.current.right.isCollapsed).toBe(false);
    expect(result.current.right.size).toBe(300);
    expect(JSON.parse(localStorage.getItem(LEFT_KEY) ?? 'null')).toEqual({
      size: 260,
      isCollapsed: true,
    });
    expect(JSON.parse(localStorage.getItem(RIGHT_KEY) ?? 'null')).toEqual({
      size: 300,
      isCollapsed: false,
    });
  });

  it('remount restores each region independently', () => {
    const first = renderHook(() => useResizable(MULTI_CONFIG));
    act(() => first.result.current.left.collapse());
    first.unmount();

    const {result} = renderHook(() => useResizable(MULTI_CONFIG));
    expect(result.current.left.isCollapsed).toBe(true);
    expect(result.current.left.size).toBe(0);
    expect(result.current.right.isCollapsed).toBe(false);
    expect(result.current.right.size).toBe(300);

    act(() => result.current.left.expand());
    expect(result.current.left.size).toBe(260);
    expect(JSON.parse(localStorage.getItem(RIGHT_KEY) ?? 'null')).toEqual({
      size: 300,
      isCollapsed: false,
    });
  });

  it('mixed legacy and object entries restore per-format and migrate', () => {
    localStorage.setItem(LEFT_KEY, '340');
    localStorage.setItem(
      RIGHT_KEY,
      JSON.stringify({size: 300, isCollapsed: true}),
    );
    const config = {
      regions: {
        left: {
          defaultSize: 260,
          minSizePx: 100,
          maxSizePx: 600,
          collapsible: true,
        },
        right: {
          defaultSize: 300,
          minSizePx: 100,
          maxSizePx: 600,
          collapsible: true,
        },
      },
      autoSaveId: 'layout',
    };
    const {result} = renderHook(() => useResizable(config));

    expect(result.current.left.size).toBe(340);
    expect(result.current.left.isCollapsed).toBe(false);
    expect(result.current.right.size).toBe(0);
    expect(result.current.right.isCollapsed).toBe(true);
    // The legacy width-only entry migrates to the object format on mount.
    expect(JSON.parse(localStorage.getItem(LEFT_KEY) ?? 'null')).toEqual({
      size: 340,
      isCollapsed: false,
    });
    expect(JSON.parse(localStorage.getItem(RIGHT_KEY) ?? 'null')).toEqual({
      size: 300,
      isCollapsed: true,
    });
  });

  it('a non-collapsible region ignores a persisted collapsed flag', () => {
    localStorage.setItem(
      'astryx-resizable:layout:main',
      JSON.stringify({size: 400, isCollapsed: true}),
    );
    const config = {
      regions: {
        main: {defaultSize: 500, minSizePx: 100, maxSizePx: 600},
        side: {
          defaultSize: 200,
          minSizePx: 100,
          maxSizePx: 600,
          collapsible: true,
        },
      },
      autoSaveId: 'layout',
    };
    const {result} = renderHook(() => useResizable(config));

    expect(result.current.main.isCollapsed).toBe(false);
    expect(result.current.main.size).toBe(400);
    expect(result.current.side.isCollapsed).toBe(false);
    expect(result.current.side.size).toBe(200);
    // Current policy: storage mirrors live state, so the flag is rewritten.
    expect(
      JSON.parse(
        localStorage.getItem('astryx-resizable:layout:main') ?? 'null',
      ),
    ).toEqual({size: 400, isCollapsed: false});
  });

  it('works purely in memory when no autoSaveId is given', () => {
    const config = {
      regions: {
        left: {
          defaultSize: 260,
          minSizePx: 100,
          maxSizePx: 600,
          collapsible: true,
        },
        right: {defaultSize: 300, minSizePx: 100, maxSizePx: 600},
      },
    };
    const {result} = renderHook(() => useResizable(config));
    expect(localStorage.length).toBe(0);

    act(() => result.current.left.collapse());
    expect(result.current.left.isCollapsed).toBe(true);
    expect(localStorage.length).toBe(0);

    act(() => result.current.left.expand());
    expect(result.current.left.size).toBe(260);
    expect(localStorage.length).toBe(0);
  });

  it('ignores and preserves a bare single-region entry under the same id', () => {
    localStorage.setItem('astryx-resizable:layout', '340');
    const {result} = renderHook(() => useResizable(MULTI_CONFIG));

    expect(result.current.left.size).toBe(260);
    expect(result.current.right.size).toBe(300);
    // The orphaned pre-multi entry is neither read nor rewritten.
    expect(localStorage.getItem('astryx-resizable:layout')).toBe('340');
    expect(JSON.parse(localStorage.getItem(LEFT_KEY) ?? 'null')).toEqual({
      size: 260,
      isCollapsed: false,
    });
  });
});

// =============================================================================
// Sizing interactions
// =============================================================================

describe('useResizable sizing interactions', () => {
  it('snaps a restored persisted width to the nearest snap', () => {
    localStorage.setItem(KEY, '240');
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, snaps: [200, 300]}),
    );
    expect(result.current.size).toBe(200);
  });

  it('snap round-trip: resize snaps, collapse and expand return to the snap', () => {
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, snaps: [200, 300], collapsible: true}),
    );
    expect(result.current.size).toBe(300);

    act(() => result.current.resize(280));
    expect(result.current.size).toBe(300);

    act(() => result.current.collapse());
    act(() => result.current.expand());
    expect(result.current.size).toBe(300);
  });

  it('snaps the saved width of a restored collapsed entry', () => {
    localStorage.setItem(KEY, JSON.stringify({size: 240, isCollapsed: true}));
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, snaps: [200, 300], collapsible: true}),
    );
    expect(result.current.isCollapsed).toBe(true);
    // The mount write re-snaps the stored width.
    expect(JSON.parse(localStorage.getItem(KEY) ?? 'null')).toEqual({
      size: 200,
      isCollapsed: true,
    });
    act(() => result.current.expand());
    expect(result.current.size).toBe(200);
  });

  it('clamps a persisted width above the maximum on restore', () => {
    localStorage.setItem(KEY, '900');
    const {result} = renderHook(() => useResizable(BASE_CONFIG));
    expect(result.current.size).toBe(480);
  });

  it('resolves a percentage defaultSize against the window width', () => {
    const expected = Math.round(0.2 * window.innerWidth);
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, defaultSize: '20%', minSizePx: 50}),
    );
    expect(result.current.size).toBe(expected);
  });

  it('lets a persisted width win over a percentage defaultSize', () => {
    localStorage.setItem(KEY, '320');
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, defaultSize: '20%'}),
    );
    expect(result.current.size).toBe(320);
  });

  it('falls back to 250 for a malformed percentage defaultSize', () => {
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, defaultSize: 'abc%'}),
    );
    expect(result.current.size).toBe(250);
  });

  it('expands a legacy collapsed entry to the resolved percentage default', () => {
    localStorage.setItem(KEY, '0');
    const expected = Math.round(0.25 * window.innerWidth);
    const {result} = renderHook(() =>
      useResizable({
        ...BASE_CONFIG,
        defaultSize: '25%',
        minSizePx: 50,
        collapsible: true,
      }),
    );
    expect(result.current.isCollapsed).toBe(true);
    act(() => result.current.expand());
    expect(result.current.size).toBe(expected);
  });

  it('snaps an out-of-range persisted value to the nearest reachable snap', () => {
    localStorage.setItem(KEY, '900');
    const {result} = renderHook(() =>
      useResizable({...BASE_CONFIG, snaps: [200, 300]}),
    );
    expect(result.current.size).toBe(300);
  });
});
