// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, afterEach} from 'vitest';
import {render, renderHook, act, waitFor} from '@testing-library/react';
import React from 'react';
import {Theme} from './Theme';
import {defineTheme} from './defineTheme';
import {useTheme} from './useTheme';
import {resolveThemeTokens} from './tokens';

// Mock useMediaQuery — default to light mode
vi.mock('../hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn(() => false),
}));

const testTheme = defineTheme({
  name: 'test',
  tokens: {
    '--color-accent': ['#AA0000', '#FF5555'],
    '--spacing-4': '20px',
  },
});

function wrapper({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode?: 'light' | 'dark' | 'system';
}) {
  return (
    <Theme theme={testTheme} mode={mode}>
      {children}
    </Theme>
  );
}

describe('useTheme', () => {
  it('returns defaults when used outside Theme', () => {
    const {result} = renderHook(() => useTheme());
    expect(result.current.name).toBe('default');
    // Should resolve default light-dark() tokens for light mode (useMediaQuery mocked to false = light)
    expect(result.current.token('--color-text-primary')).toBe('#0A1317');
    expect(result.current.token('--spacing-1')).toBe('4px');
    expect(result.current.mode).toBe('light');
  });

  it('returns the theme name', () => {
    const {result} = renderHook(() => useTheme(), {
      wrapper: ({children}) => wrapper({children, mode: 'light'}),
    });
    expect(result.current.name).toBe('test');
  });

  it('resolves tuple tokens to light values in light mode', () => {
    const {result} = renderHook(() => useTheme(), {
      wrapper: ({children}) => wrapper({children, mode: 'light'}),
    });
    expect(result.current.token('--color-accent')).toBe('#AA0000');
  });

  it('resolves tuple tokens to dark values in dark mode', () => {
    const {result} = renderHook(() => useTheme(), {
      wrapper: ({children}) => wrapper({children, mode: 'dark'}),
    });
    expect(result.current.token('--color-accent')).toBe('#FF5555');
  });

  it('resolves single-value tokens unchanged', () => {
    const {result} = renderHook(() => useTheme(), {
      wrapper: ({children}) => wrapper({children, mode: 'light'}),
    });
    expect(result.current.token('--spacing-4')).toBe('20px');
  });

  it('falls back to defaults for tokens not in theme', () => {
    const {result} = renderHook(() => useTheme(), {
      wrapper: ({children}) => wrapper({children, mode: 'light'}),
    });
    // --spacing-1 is not overridden — should be the default '4px'
    expect(result.current.token('--spacing-1')).toBe('4px');
  });

  it('resolves default light-dark() string tokens for the mode', () => {
    const {result} = renderHook(() => useTheme(), {
      wrapper: ({children}) => wrapper({children, mode: 'dark'}),
    });
    // --color-text-primary defaults to light-dark(#0A1317, #DFE2E5)
    expect(result.current.token('--color-text-primary')).toBe('#DFE2E5');
  });

  it('returns empty string for unknown tokens', () => {
    const {result} = renderHook(() => useTheme(), {
      wrapper: ({children}) => wrapper({children, mode: 'light'}),
    });
    expect(result.current.token('--nonexistent')).toBe('');
  });

  it('exposes mode reflecting effective mode', () => {
    const {result} = renderHook(() => useTheme(), {
      wrapper: ({children}) => wrapper({children, mode: 'dark'}),
    });
    expect(result.current.mode).toBe('dark');
  });

  it('provides a tokens map with all resolved values', () => {
    const {result} = renderHook(() => useTheme(), {
      wrapper: ({children}) => wrapper({children, mode: 'light'}),
    });
    const tokens = result.current.tokens;
    expect(tokens['--color-accent']).toBe('#AA0000');
    expect(tokens['--spacing-4']).toBe('20px');
    expect(tokens['--spacing-1']).toBe('4px');
  });

  it('uses the same token resolution as resolveThemeTokens', () => {
    const {result} = renderHook(() => useTheme(), {
      wrapper: ({children}) => wrapper({children, mode: 'dark'}),
    });

    expect(result.current.tokens).toEqual(
      resolveThemeTokens(testTheme, {mode: 'dark'}),
    );
  });

  it('resolves derived accent tokens to raw values, not var()/color-mix', () => {
    const brandTheme = defineTheme({name: 'brand', color: {accent: '#0064E0'}});
    const {result} = renderHook(() => useTheme(), {
      wrapper: ({children}) => (
        <Theme theme={brandTheme} mode="light">
          {children}
        </Theme>
      ),
    });

    const accent = result.current.token('--color-accent');
    expect(result.current.token('--color-text-accent')).toBe(accent);
    expect(result.current.token('--color-icon-accent')).toBe(accent);
    expect(result.current.token('--color-accent-muted')).toMatch(/^(#|rgb)/);
    expect(result.current.token('--color-accent-muted')).not.toContain('var(');
    expect(result.current.token('--color-accent-muted')).not.toContain(
      'color-mix',
    );
  });
});

// Covers the fallback used when a component calls useTheme() with no
// ThemeContext ancestor reachable — e.g. a detached tree (useToast's
// fallback viewport, other portals appended straight to document.body).
// Root Theme instances sync their mode to <html data-theme> specifically so
// this fallback can resolve the app's actual mode instead of jumping
// straight to OS preference (see Theme.tsx's useRootThemeSync).
describe('useTheme mode resolution without a ThemeContext ancestor', () => {
  afterEach(async () => {
    // The hook from each `it` below is still mounted and subscribed to the
    // shared MutationObserver when this runs (RTL's own cleanup — which
    // unmounts it — is registered after this file's afterEach), so removing
    // the attribute here triggers a live state update; flush it inside act
    // so React doesn't warn about an update outside one.
    await act(async () => {
      document.documentElement.removeAttribute('data-theme');
    });
  });

  it('resolves mode from <html data-theme> when set', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const {result} = renderHook(() => useTheme());
    expect(result.current.mode).toBe('dark');
  });

  it('falls back to OS preference when <html data-theme> is absent', () => {
    // useMediaQuery is mocked to false (light) at the top of this file.
    const {result} = renderHook(() => useTheme());
    expect(result.current.mode).toBe('light');
  });

  it('stays live when <html data-theme> changes after mount', async () => {
    const {result} = renderHook(() => useTheme());
    expect(result.current.mode).toBe('light');

    act(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });

    await waitFor(() => expect(result.current.mode).toBe('dark'));
  });
});

// Covers the singleton MutationObserver + no-op gating in useRootThemeModeAttr:
// provider-path consumers (a ThemeContext ancestor is reachable) must not
// create an observer or react to <html data-theme> at all, and every
// no-context consumer must share exactly one observer, refcounted down to
// zero as they unmount.
describe('useTheme root-attribute observer lifecycle', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    // vi.stubGlobal'd MutationObserver stubs below are torn down here even if
    // a test fails partway through, instead of relying on a manual restore
    // line at the end of each test that a mid-test throw would skip.
    vi.unstubAllGlobals();
  });

  it('creates no observer and does not re-render provider-path consumers when <html data-theme> changes', () => {
    const ObserverSpy = vi.fn();
    vi.stubGlobal('MutationObserver', ObserverSpy);

    const renders = {count: 0};
    function Consumer() {
      useTheme();
      renders.count++;
      return null;
    }

    render(
      <Theme theme={testTheme} mode="light">
        <Consumer />
      </Theme>,
    );

    expect(ObserverSpy).not.toHaveBeenCalled();

    const before = renders.count;
    act(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    expect(renders.count).toBe(before);
  });

  it('shares one observer across multiple no-context consumers and disconnects once all unmount', () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    const ObserverSpy = vi
      .fn()
      .mockImplementation(() => ({observe, disconnect}));
    vi.stubGlobal('MutationObserver', ObserverSpy);

    const first = renderHook(() => useTheme());
    const second = renderHook(() => useTheme());

    expect(ObserverSpy).toHaveBeenCalledTimes(1);
    expect(observe).toHaveBeenCalledTimes(1);

    first.unmount();
    expect(disconnect).not.toHaveBeenCalled();

    second.unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
