// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useXDSTheme.ts
 * @input XDSThemeContext provided by XDSTheme
 * @output Exports useXDSTheme hook for programmatic access to resolved theme tokens
 * @position Theme hook; used by data viz, canvas, and non-CSS consumers
 *
 * Provides synchronous access to theme token values resolved for the
 * current color mode — no DOM reads, no double render. Token resolution
 * is shared with the server-safe helpers in ./tokens.ts.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/theme/index.ts
 */

import {createContext, use, useMemo} from 'react';
import type {ThemeMode} from './types';
import type {XDSDefinedTheme} from './defineTheme';
import {resolveXDSThemeTokens} from './tokens';
import {useMediaQuery} from '../hooks/useMediaQuery';

// =============================================================================
// Context
// =============================================================================

/**
 * Internal context value — carries the theme + mode from XDSTheme.
 * @internal
 */
export interface XDSThemeContextValue {
  /** The defined theme object */
  theme: XDSDefinedTheme;
  /** The color mode prop passed to XDSTheme */
  mode: ThemeMode;
}

/**
 * React context for the nearest XDSTheme provider.
 * null when no provider is present.
 * @internal
 */
export const XDSThemeContext = createContext<XDSThemeContextValue | null>(null);
XDSThemeContext.displayName = 'XDSThemeContext';

// =============================================================================
// Return type
// =============================================================================

/**
 * Resolved theme data returned by useXDSTheme.
 */
export interface UseXDSThemeReturn {
  /** Theme name */
  name: string;
  /** Resolved effective mode ('light' | 'dark') — never 'system' */
  mode: 'light' | 'dark';
  /**
   * Resolve a token to its raw CSS value for the current color mode.
   *
   * For tokens with [light, dark] tuples, returns the value matching
   * the current mode. For single-value tokens, returns the value as-is.
   *
   * Falls back to xdsTokenDefaults if the token isn't overridden by the theme.
   *
   * @example
   * ```
   * const accent = token('--color-accent'); // "#0064E0" in light mode
   * const spacing = token('--spacing-4');   // "16px"
   * ```
   */
  token: (name: string) => string;
  /**
   * All tokens resolved for the current color mode.
   *
   * Merges xdsTokenDefaults with the theme's overrides, resolving
   * light-dark() values based on the effective color mode.
   *
   * Memoized — stable reference unless theme or mode changes.
   */
  tokens: Record<string, string>;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Access the current XDS theme's token values, resolved for the active color mode.
 *
 * Returns raw CSS values (hex colors, px values, etc.) suitable for
 * non-CSS consumers like canvas, SVG, or data visualization libraries
 * (e.g. Vega, D3, Chart.js) that need concrete values rather than
 * CSS custom property references.
 *
 * When called outside an <XDSTheme> provider, returns the default theme
 * tokens resolved against the current system color mode.
 *
 * @example
 * ```
 * function Chart() {
 *   const { token, mode } = useXDSTheme();
 *   return (
 *     <svg>
 *       <rect fill={token('--color-accent')} />
 *       <text fill={token('--color-text-primary')}>Sales</text>
 *     </svg>
 *   );
 * }
 * ```
 */
export function useXDSTheme(): UseXDSThemeReturn {
  const ctx = use(XDSThemeContext);

  // Resolve 'system' to 'light' | 'dark' using the OS preference
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const mode = ctx?.mode ?? 'system';
  const theme = ctx?.theme ?? null;

  const effectiveMode: 'light' | 'dark' =
    mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;

  // Build the full resolved map, memoized on theme + effective mode
  const tokens = useMemo(
    () => resolveXDSThemeTokens(theme, {mode: effectiveMode}),
    [theme, effectiveMode],
  );

  const token = (name: string): string => {
    return tokens[name] ?? '';
  };

  return {
    name: theme?.name ?? 'default',
    mode: effectiveMode,
    token,
    tokens,
  };
}
