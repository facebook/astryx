// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file effectiveBreakpoints.test.tsx
 * Tests the package-internal width-point accessor (spec:AST-031 FR5): one
 * resolution order for every consumer, and no component reaching into
 * `DefinedTheme.__adaptations` on its own.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import type {ReactNode} from 'react';
import {renderHook} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {DEFAULT_WIDTH_BREAKPOINTS} from './adaptationConditions';
import {
  getEffectiveWidthBreakpoints,
  useEffectiveWidthBreakpoints,
} from './effectiveBreakpoints';
import {Theme} from './Theme';
import {defineTheme, type DefinedTheme} from './defineTheme';
import {resetThemes} from './themeRegistry';

function built(input: Parameters<typeof defineTheme>[0]): DefinedTheme {
  return {...defineTheme(input), __built: true as const};
}

function themeWrapper(theme: DefinedTheme) {
  return function Wrapper({children}: {children: ReactNode}) {
    return <Theme theme={theme}>{children}</Theme>;
  };
}

beforeEach(() => {
  resetThemes();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getEffectiveWidthBreakpoints', () => {
  it('returns the AST-012 defaults without a theme', () => {
    expect(getEffectiveWidthBreakpoints(undefined)).toBe(
      DEFAULT_WIDTH_BREAKPOINTS,
    );
    expect(getEffectiveWidthBreakpoints(null)).toEqual({
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    });
  });

  it("merges a theme's overrides over the defaults", () => {
    const theme = built({
      name: 'accessor-overrides',
      adaptations: {widthBreakpoints: {md: 800, '2xl': 1800}},
    });

    expect(getEffectiveWidthBreakpoints(theme)).toEqual({
      ...DEFAULT_WIDTH_BREAKPOINTS,
      md: 800,
      '2xl': 1800,
    });
  });

  it('completes a partial map from a built theme, per name', () => {
    const partial = {
      ...defineTheme({name: 'accessor-partial'}),
      __built: true as const,
      __adaptations: {widthBreakpoints: {md: 700}, rules: []},
    } as unknown as DefinedTheme;

    expect(getEffectiveWidthBreakpoints(partial)).toEqual({
      ...DEFAULT_WIDTH_BREAKPOINTS,
      md: 700,
    });
  });

  it('falls back per name when a stored point is explicitly undefined', () => {
    // A spread-built or hand-assembled map can carry `{md: undefined}`, which
    // an object spread would let overwrite the default with nothing.
    const explicitUndefined = {
      ...defineTheme({name: 'accessor-explicit-undefined'}),
      __built: true as const,
      __adaptations: {
        widthBreakpoints: {
          sm: 640,
          md: undefined,
          lg: 1100,
          xl: undefined,
          '2xl': 1536,
        },
        rules: [],
      },
    } as unknown as DefinedTheme;

    expect(getEffectiveWidthBreakpoints(explicitUndefined)).toEqual({
      ...DEFAULT_WIDTH_BREAKPOINTS,
      lg: 1100,
    });
    // Every name answers a number — nothing resolves to undefined.
    for (const point of Object.values(
      getEffectiveWidthBreakpoints(explicitUndefined),
    )) {
      expect(typeof point).toBe('number');
    }
  });

  it('answers every named point for a theme with no adaptations', () => {
    const legacy = {name: 'accessor-legacy', tokens: {}} as DefinedTheme;

    expect(getEffectiveWidthBreakpoints(legacy)).toBe(
      DEFAULT_WIDTH_BREAKPOINTS,
    );
  });
});

describe('useEffectiveWidthBreakpoints', () => {
  it('uses the defaults with no provider and no registered root theme', () => {
    const {result} = renderHook(() => useEffectiveWidthBreakpoints());

    expect(result.current).toEqual(DEFAULT_WIDTH_BREAKPOINTS);
  });

  it('reads the nearest Theme provider', () => {
    const theme = built({
      name: 'accessor-provider',
      adaptations: {widthBreakpoints: {lg: 1200}},
    });

    const {result} = renderHook(() => useEffectiveWidthBreakpoints(), {
      wrapper: themeWrapper(theme),
    });

    expect(result.current.lg).toBe(1200);
    expect(result.current.md).toBe(768);
  });

  it('prefers the NEAREST theme when providers nest', () => {
    const outer = built({
      name: 'accessor-outer',
      adaptations: {widthBreakpoints: {md: 700}},
    });
    const inner = built({
      name: 'accessor-inner',
      adaptations: {widthBreakpoints: {md: 900}},
    });

    const {result} = renderHook(() => useEffectiveWidthBreakpoints(), {
      wrapper: ({children}: {children: ReactNode}) => (
        <Theme theme={outer}>
          <Theme theme={inner}>{children}</Theme>
        </Theme>
      ),
    });

    expect(result.current.md).toBe(900);
  });

  it('follows the registered root theme without provider context', () => {
    defineTheme({
      name: 'accessor-root',
      adaptations: {widthBreakpoints: {md: 720}},
    });
    const original = document.documentElement.getAttribute.bind(
      document.documentElement,
    );
    vi.spyOn(document.documentElement, 'getAttribute').mockImplementation(
      name => (name === 'data-astryx-theme' ? 'accessor-root' : original(name)),
    );

    const {result} = renderHook(() => useEffectiveWidthBreakpoints());

    expect(result.current.md).toBe(720);
  });

  it('is referentially stable while the theme is unchanged', () => {
    const theme = built({
      name: 'accessor-stable',
      adaptations: {widthBreakpoints: {md: 800}},
    });
    const {result, rerender} = renderHook(
      () => useEffectiveWidthBreakpoints(),
      {wrapper: themeWrapper(theme)},
    );
    const first = result.current;

    rerender();
    rerender();

    expect(result.current).toBe(first);
  });

  it('resolves exactly what the non-hook helper resolves', () => {
    // The production hook calls the helper, so the two cannot drift; this
    // pins that they agree for a theme with overrides and for none at all.
    const theme = built({
      name: 'accessor-parity',
      adaptations: {widthBreakpoints: {md: 800, xl: 1400}},
    });

    const withTheme = renderHook(() => useEffectiveWidthBreakpoints(), {
      wrapper: themeWrapper(theme),
    });
    expect(withTheme.result.current).toEqual(
      getEffectiveWidthBreakpoints(theme),
    );

    // Unmount first: a mounted root Theme syncs `<html data-astryx-theme>`,
    // which the no-provider fallback would otherwise (correctly) follow.
    withTheme.unmount();

    const {result: bare} = renderHook(() => useEffectiveWidthBreakpoints());
    expect(bare.current).toBe(getEffectiveWidthBreakpoints(undefined));
  });
});

// =============================================================================
// FR5 — components resolve width points through the accessor, never directly
// =============================================================================

describe('no direct __adaptations reads outside the theme system', () => {
  const CORE_SRC = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
  );
  const THEME_DIR = path.join(CORE_SRC, 'theme');

  function sourceFiles(dir: string): string[] {
    const found: string[] = [];
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (full === THEME_DIR || entry.name === 'node_modules') {
          continue;
        }
        found.push(...sourceFiles(full));
        continue;
      }
      if (!/\.tsx?$/.test(entry.name) || entry.name.includes('.test.')) {
        continue;
      }
      found.push(full);
    }
    return found;
  }

  it('keeps the storage field private to the theme system', () => {
    // Matches property ACCESS (`theme.__adaptations`, `theme?.__adaptations`,
    // `theme['__adaptations']`), so prose that merely names the field — the
    // reason a component must not touch it — is not itself a violation.
    const access = /(?:\.|\[\s*['"`])__adaptations/;
    const offenders = sourceFiles(CORE_SRC).filter(file =>
      access.test(fs.readFileSync(file, 'utf8')),
    );

    expect(offenders.map(file => path.relative(CORE_SRC, file))).toEqual([]);
  });
});
