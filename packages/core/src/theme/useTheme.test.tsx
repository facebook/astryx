// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {renderHook} from '@testing-library/react';
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
});
