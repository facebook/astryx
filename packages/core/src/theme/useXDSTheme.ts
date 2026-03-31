'use client';

/**
 * @file useXDSTheme.ts
 * @input XDSThemeContext provided by XDSTheme
 * @output Exports useXDSTheme hook for programmatic access to resolved theme tokens
 * @position Theme hook; used by data viz, canvas, and non-CSS consumers
 *
 * Provides synchronous access to theme token values resolved for the
 * current color mode — no DOM reads, no double render.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/theme/index.ts
 * - /packages/core/src/theme/README.md (if present)
 */

import {createContext, useContext, useMemo} from 'react';
import type {ThemeMode} from './types';
import type {XDSDefinedTheme, XDSTokenValue} from './defineTheme';
import {xdsTokenDefaults} from './defineTheme';
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
// Helpers
// =============================================================================

/**
 * Resolve a single token value for a given mode.
 * - [light, dark] tuple → picks the correct side
 * - string → if it's a light-dark() CSS function, parse and pick; otherwise pass through
 */
function resolveValue(value: XDSTokenValue, mode: 'light' | 'dark'): string {
  if (Array.isArray(value)) {
    return mode === 'dark' ? value[1] : value[0];
  }
  // For string values, try to parse light-dark(a, b) from defaults
  const match = value.match(/^light-dark\(\s*(.+?)\s*,\s*(.+?)\s*\)$/);
  if (match) {
    return mode === 'dark' ? match[2] : match[1];
  }
  return value;
}

/**
 * Build the full resolved token map for a theme + mode.
 */
function buildResolvedTokens(
  theme: XDSDefinedTheme,
  mode: 'light' | 'dark',
): Record<string, string> {
  const resolved = buildDefaultTokens(mode);

  // Layer theme overrides on top
  // Prefer __inputTokens (preserves tuples) over .tokens (already resolved to light-dark() strings)
  if (theme.__inputTokens) {
    for (const [key, value] of Object.entries(theme.__inputTokens)) {
      if (value !== undefined) {
        resolved[key] = resolveValue(value, mode);
      }
    }
  } else {
    // Fallback: parse light-dark() strings from .tokens
    for (const [key, value] of Object.entries(theme.tokens)) {
      resolved[key] = resolveValue(value, mode);
    }
  }

  return resolved;
}

/**
 * Build the resolved token map from defaults only (no theme provider).
 */
function buildDefaultTokens(mode: 'light' | 'dark'): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const [key, value] of Object.entries(xdsTokenDefaults)) {
    resolved[key] = resolveValue(value, mode);
  }
  return resolved;
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
 * Must be called inside an <XDSTheme> provider.
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
  const ctx = useContext(XDSThemeContext);

  // Resolve 'system' to 'light' | 'dark' using the OS preference
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const mode = ctx?.mode ?? 'system';
  const theme = ctx?.theme ?? null;

  const effectiveMode: 'light' | 'dark' =
    mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;

  // Build the full resolved map, memoized on theme + effective mode
  const tokens = useMemo(
    () =>
      theme
        ? buildResolvedTokens(theme, effectiveMode)
        : buildDefaultTokens(effectiveMode),
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
