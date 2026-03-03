/**
 * @file useMediaQuery.test.ts
 * @input Uses vitest, @testing-library/react, useMediaQuery hook
 * @output Unit tests for useMediaQuery hook
 * @position Testing; validates useMediaQuery.ts implementation
 *
 * SYNC: When useMediaQuery.ts changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useMediaQuery} from './useMediaQuery';

// Mock matchMedia
function createMockMatchMedia(matches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  return {
    matches,
    media: '',
    onchange: null,
    addEventListener: vi.fn(
      (_event: string, handler: (e: MediaQueryListEvent) => void) => {
        listeners.push(handler);
      },
    ),
    removeEventListener: vi.fn(
      (_event: string, handler: (e: MediaQueryListEvent) => void) => {
        const index = listeners.indexOf(handler);
        if (index > -1) listeners.splice(index, 1);
      },
    ),
    dispatchEvent: vi.fn(),
    // Helper to simulate media query change
    _triggerChange(newMatches: boolean) {
      this.matches = newMatches;
      listeners.forEach(fn => fn({matches: newMatches} as MediaQueryListEvent));
    },
    _listeners: listeners,
  };
}

describe('useMediaQuery', () => {
  let mockMql: ReturnType<typeof createMockMatchMedia>;

  beforeEach(() => {
    mockMql = createMockMatchMedia(false);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));
  });

  it('returns false on initial render (SSR-safe)', () => {
    const {result} = renderHook(() => useMediaQuery('(max-width: 768px)'));
    // Before the effect runs, should be false
    expect(result.current).toBe(false);
  });

  it('syncs with matchMedia on mount', () => {
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    const {result} = renderHook(() => useMediaQuery('(max-width: 768px)'));
    // After effect, should match the mql state
    expect(result.current).toBe(true);
  });

  it('updates when media query changes', () => {
    const {result} = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(false);

    act(() => {
      mockMql._triggerChange(true);
    });
    expect(result.current).toBe(true);

    act(() => {
      mockMql._triggerChange(false);
    });
    expect(result.current).toBe(false);
  });

  it('passes the query string to matchMedia', () => {
    renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1024px)');
  });

  it('cleans up event listener on unmount', () => {
    const {unmount} = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(mockMql.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );

    unmount();
    expect(mockMql.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
  });

  it('re-subscribes when query changes', () => {
    const mockMql2 = createMockMatchMedia(true);
    const matchMediaFn = vi.fn().mockReturnValue(mockMql);
    vi.stubGlobal('matchMedia', matchMediaFn);

    const {result, rerender} = renderHook(
      ({query}: {query: string}) => useMediaQuery(query),
      {initialProps: {query: '(max-width: 768px)'}},
    );
    expect(result.current).toBe(false);

    // Change query
    matchMediaFn.mockReturnValue(mockMql2);
    rerender({query: '(max-width: 1024px)'});
    expect(result.current).toBe(true);
    expect(matchMediaFn).toHaveBeenCalledWith('(max-width: 1024px)');
  });
});
