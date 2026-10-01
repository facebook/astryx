// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file density.ts
 * @input A defined theme and a density ('default' | 'compact')
 * @output Exports ThemeDensity, DensityContext, useThemeDensity, resolveDensityTokens
 * @position Theme utility; consumed by Theme.tsx (root custom properties),
 *   Table (row density default), and SideNavItem/TopNavItem (row size default)
 *
 * Density is one decision for a whole region: "this is a dense tool". Compact
 * tightens the spacing scale, steps the type ramp down about one step, and
 * (in Theme) cascades `SizeProvider` value `sm` so controls render small.
 *
 * Values are derived from the theme's own effective tokens (its overrides over
 * the core defaults), so compact scales a theme's spacing and type scale rather
 * than replacing them with fixed numbers. They are written as CSS custom
 * properties on the Theme root element — no measurement, SSR-safe.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/theme/density.test.tsx
 * - /packages/core/src/theme/Theme.doc.mjs (density prop + dense example)
 */

import {createContext, use} from 'react';
import type {DefinedTheme} from './defineTheme';
import {
  spacingDefaults,
  textSizeDefaults,
  typeScaleDefaults,
} from './tokens.stylex';

/** Region density. `default` is the standard scale; `compact` suits dense tools. */
export type ThemeDensity = 'default' | 'compact';

/**
 * Effective density of the nearest Theme. `default` when there is no Theme or
 * no Theme in the tree asked for compact.
 * @internal
 */
export const DensityContext = createContext<ThemeDensity>('default');
DensityContext.displayName = 'DensityContext';

/** Read the effective density of the nearest Theme. */
export function useThemeDensity(): ThemeDensity {
  return use(DensityContext);
}

// =============================================================================
// Compact scale rules
// =============================================================================

/** Spacing steps that compact tightens. --spacing-0 … --spacing-2 stay intact. */
const COMPACT_SPACING_TOKENS = [
  '--spacing-3',
  '--spacing-4',
  '--spacing-5',
  '--spacing-6',
  '--spacing-7',
  '--spacing-8',
  '--spacing-9',
  '--spacing-10',
  '--spacing-11',
  '--spacing-12',
] as const satisfies ReadonlyArray<keyof typeof spacingDefaults>;

/** Compact spacing multiplier: 12→9, 16→12, 24→18, 32→24, 48→36. */
const SPACING_FACTOR = 0.75;

/** Compact type multiplier: 14→13, 17→16, 20→19, 24→22, 42→39. */
const TYPE_FACTOR = 13 / 14;

/**
 * Compact never pushes a size below this many px; sizes already below it
 * (tiny sub-scale steps) keep their value. 12→11, 11→11, 10→10.
 */
const MIN_COMPACT_TEXT_PX = 11;

const RAW_SIZE_TOKENS = Object.keys(textSizeDefaults);

/** Semantic role prefixes: `--text-<role>-size` / `--text-<role>-leading`. */
const ROLE_PREFIXES = Object.keys(typeScaleDefaults)
  .filter(name => name.endsWith('-size'))
  .map(name => name.slice(0, -'-size'.length));

/** Every custom property density can write, in a stable order. */
export const DENSITY_TOKEN_NAMES: ReadonlyArray<string> = [
  ...COMPACT_SPACING_TOKENS,
  ...RAW_SIZE_TOKENS,
  ...ROLE_PREFIXES.flatMap(role => [`${role}-size`, `${role}-leading`]),
];

// =============================================================================
// Resolution helpers
// =============================================================================

const DEFAULTS: Record<string, string> = {
  ...spacingDefaults,
  ...textSizeDefaults,
  ...typeScaleDefaults,
};

const VAR_REF = /^var\(\s*(--[\w-]+)\s*\)$/;

/** The theme's declared value for a token, else the core default. */
function declared(theme: DefinedTheme, name: string): string | undefined {
  return theme.tokens[name] ?? DEFAULTS[name];
}

/** Follow bare `var(--x)` references to a concrete value (depth-limited). */
function resolveValue(theme: DefinedTheme, name: string): string | undefined {
  let value = declared(theme, name);
  for (let depth = 0; value != null && depth < 8; depth++) {
    const ref = VAR_REF.exec(value.trim());
    if (!ref) {
      return value.trim();
    }
    value = declared(theme, ref[1]);
  }
  return undefined;
}

/** Parse a `px` or `rem` length into px (16px root). */
function toPx(value: string | undefined): number | null {
  if (value == null) {
    return null;
  }
  const match = /^(-?\d*\.?\d+)(px|rem)$/.exec(value);
  if (!match) {
    return null;
  }
  const n = Number(match[1]);
  return match[2] === 'rem' ? n * 16 : n;
}

function remOf(px: number): string {
  return `${Math.round((px / 16) * 10000) / 10000}rem`;
}

function round4(n: number): string {
  return String(Math.round(n * 10000) / 10000);
}

/** Compact font size in px for a default size in px. */
export function compactTextPx(px: number): number {
  if (px <= MIN_COMPACT_TEXT_PX) {
    return px;
  }
  return Math.max(MIN_COMPACT_TEXT_PX, Math.round(px * TYPE_FACTOR));
}

/**
 * Compact line height in px: about 1.35 for text sizes, 1.25 from 20px up,
 * on an even-px grid, never tighter than size + 4.
 */
export function compactLeadingPx(sizePx: number): number {
  const roundEven = (n: number) => Math.round(n / 2) * 2;
  const floor = Math.ceil((sizePx + 4) / 2) * 2;
  const target = sizePx < 20 ? 1.35 : 1.25;
  return Math.max(floor, roundEven(sizePx * target));
}

// =============================================================================
// Resolver
// =============================================================================

/**
 * Custom properties that apply a density to a theme region.
 *
 * - `compact`: spacing steps 3–12 ×0.75, every raw font size and semantic
 *   role size stepped down (`compactTextPx`) with tight line heights.
 *   Values derive from the theme's effective tokens; a value that is not a
 *   plain `px`/`rem` length is scaled with `calc()` (spacing) or left alone
 *   (type).
 * - `default`: the theme's own effective values for the same properties.
 *   Only needed to restore the default scale inside a compact region.
 */
export function resolveDensityTokens(
  theme: DefinedTheme,
  density: ThemeDensity,
): Record<string, string> {
  const out: Record<string, string> = {};

  if (density === 'default') {
    for (const name of DENSITY_TOKEN_NAMES) {
      const value = declared(theme, name);
      if (value != null) {
        out[name] = value;
      }
    }
    return out;
  }

  for (const name of COMPACT_SPACING_TOKENS) {
    const value = resolveValue(theme, name);
    if (value == null) {
      continue;
    }
    const px = toPx(value);
    out[name] =
      px == null
        ? `calc(${value} * ${SPACING_FACTOR})`
        : `${Math.round(px * SPACING_FACTOR)}px`;
  }

  for (const name of RAW_SIZE_TOKENS) {
    const px = toPx(resolveValue(theme, name));
    if (px != null) {
      out[name] = remOf(compactTextPx(px));
    }
  }

  for (const role of ROLE_PREFIXES) {
    const px = toPx(resolveValue(theme, `${role}-size`));
    if (px == null) {
      continue;
    }
    const size = compactTextPx(px);
    out[`${role}-size`] = remOf(size);
    out[`${role}-leading`] = round4(compactLeadingPx(size) / size);
  }

  return out;
}
