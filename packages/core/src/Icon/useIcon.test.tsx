// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useIcon.test.tsx
 * Parity tests for the client icon hooks: useComponentIcon must resolve a slot
 * from the active theme exactly as getComponentIcon resolves it for that theme.
 */

import type {PropsWithChildren, ReactNode} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {renderHook} from '@testing-library/react';
import {Theme} from '../theme/Theme';
import {defineTheme} from '../theme/defineTheme';
import {resetThemes} from '../theme/themeRegistry';
import {__resetDevWarnings} from '../utils/devWarning';
import {defaultIcons} from './defaultIcons';
import {
  getComponentIcon,
  registerIcons,
  resetIcons,
  type IconName,
} from './globalIconRegistry';
import type {ComponentIconSlotName} from './index';
import {useComponentIcon, useIcon} from './useIcon';

declare module './index' {
  interface ComponentIconSlotMap {
    'fixture-card-dismiss': true;
    'fixture-card-status': true;
  }
}

function createThemeWrapper(theme: ReturnType<typeof defineTheme>) {
  function ThemeWrapper({children}: PropsWithChildren): ReactNode {
    return <Theme theme={theme}>{children}</Theme>;
  }
  return ThemeWrapper;
}

describe('useComponentIcon', () => {
  beforeEach(() => {
    resetIcons();
    resetThemes();
    __resetDevWarnings();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the fallback artwork, or null, outside any theme', () => {
    const {result: named} = renderHook((): ReactNode =>
      useComponentIcon('fixture-card-dismiss', 'close'),
    );
    const {result: hidden} = renderHook((): ReactNode =>
      useComponentIcon('fixture-card-dismiss', null),
    );

    expect(named.current).toBe(defaultIcons.close);
    expect(hidden.current).toBeNull();
  });

  it('matches getComponentIcon for the active theme across every case', () => {
    registerIcons({check: 'global-check'});
    const theme = defineTheme({
      name: 'slots',
      componentIcons: {
        'fixture-card-dismiss': 'success',
        'fixture-card-status': null,
      },
      icons: {success: 'theme-success', close: 'theme-close'},
    });
    const cases: [ComponentIconSlotName, IconName | null][] = [
      ['fixture-card-dismiss', 'close'],
      ['fixture-card-dismiss', null],
      ['fixture-card-status', 'check'],
      ['fixture-card-status', null],
    ];

    for (const [slot, fallback] of cases) {
      const {result} = renderHook(
        (): ReactNode => useComponentIcon(slot, fallback),
        {
          wrapper: createThemeWrapper(theme),
        },
      );
      expect(result.current).toBe(getComponentIcon(slot, fallback, theme));
    }

    const {result: mapped} = renderHook(
      (): ReactNode => useComponentIcon('fixture-card-dismiss', 'close'),
      {wrapper: createThemeWrapper(theme)},
    );
    const {result: hidden} = renderHook(
      (): ReactNode => useComponentIcon('fixture-card-status', 'check'),
      {wrapper: createThemeWrapper(theme)},
    );
    expect(mapped.current).toBe('theme-success');
    expect(hidden.current).toBeNull();
  });

  it('uses the fallback through the active theme when the slot is unmapped', () => {
    const theme = defineTheme({
      name: 'unmapped',
      icons: {close: 'theme-close'},
    });

    const {result} = renderHook(
      (): {slot: ReactNode; shared: ReactNode} => ({
        slot: useComponentIcon('fixture-card-dismiss', 'close'),
        shared: useIcon('close'),
      }),
      {wrapper: createThemeWrapper(theme)},
    );

    expect(result.current.slot).toBe('theme-close');
    expect(result.current.slot).toBe(result.current.shared);
  });

  it('follows the nearest theme', () => {
    const outer = defineTheme({
      name: 'outer',
      componentIcons: {'fixture-card-dismiss': 'info'},
    });
    const inner = defineTheme({
      name: 'inner',
      componentIcons: {'fixture-card-dismiss': 'warning'},
    });
    function Nested({children}: PropsWithChildren): ReactNode {
      return (
        <Theme theme={outer}>
          <Theme theme={inner}>{children}</Theme>
        </Theme>
      );
    }

    const {result} = renderHook(
      (): ReactNode => useComponentIcon('fixture-card-dismiss', 'close'),
      {wrapper: Nested},
    );

    expect(result.current).toBe(defaultIcons.warning);
  });
});
