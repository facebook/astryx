// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTheme.ts
 * @input ThemeContext provided by Theme
 * @output Exports useTheme hook for programmatic access to resolved theme tokens
 * @position Theme hook; used by data viz, canvas, and non-CSS consumers
 *
 * Provides synchronous access to theme token values resolved for the
 * current color mode — no DOM reads on the provider path, no double render.
 * Without a reachable ThemeContext it consults `<html data-theme>` (kept in
 * sync by Theme) via a single shared, refcounted MutationObserver before
 * assuming OS preference; provider-path consumers subscribe to a no-op
 * store instead (the same args-switch technique useMediaQuery uses), so
 * mounting under a Theme never creates an observer. Token resolution is
 * shared with the server-safe helpers in ./tokens.ts.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/theme/index.ts
 */

import {createContext, use, useMemo, useSyncExternalStore} from 'react';
import type {ThemeMode} from './types';
import type {DefinedTheme} from './defineTheme';
import {resolveThemeTokens} from './tokens';
import {useMediaQuery} from '../hooks/useMediaQuery';

// =============================================================================
// Context
// =============================================================================

/**
 * Internal context value — carries the theme + mode from Theme.
 * @internal
 */
export interface ThemeContextValue {
  /** The defined theme object */
  theme: DefinedTheme;
  /** The color mode prop passed to Theme */
  mode: ThemeMode;
}

/**
 * React context for the nearest Theme provider.
 * null when no provider is present.
 * @internal
 */
export const ThemeContext = createContext<ThemeContextValue | null>(null);
ThemeContext.displayName = 'ThemeContext';

// =============================================================================
// Return type
// =============================================================================

/**
 * Resolved theme data returned by useTheme.
 */
export interface UseThemeReturn {
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
   * Falls back to tokenDefaults if the token isn't overridden by the theme.
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
   * Merges tokenDefaults with the theme's overrides, resolving
   * light-dark() values based on the effective color mode.
   *
   * Memoized — stable reference unless theme or mode changes.
   */
  tokens: Record<string, string>;
}

// =============================================================================
// Hook
// =============================================================================

function getRootThemeAttrSnapshot(): 'light' | 'dark' | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'light' || attr === 'dark' ? attr : null;
}

function getRootThemeAttrServerSnapshot(): 'light' | 'dark' | null {
  return null;
}

function getNullThemeMode(): null {
  return null;
}

// Every no-context consumer wants the same <html data-theme> attribute, so
// one MutationObserver — refcounted via this listener set — serves all of
// them instead of one per consumer.
const rootThemeAttrListeners = new Set<() => void>();
let rootThemeAttrObserver: MutationObserver | null = null;

function notifyRootThemeAttrListeners(): void {
  for (const listener of rootThemeAttrListeners) {
    listener();
  }
}

function subscribeRootThemeAttr(onStoreChange: () => void): () => void {
  rootThemeAttrListeners.add(onStoreChange);

  if (
    rootThemeAttrListeners.size === 1 &&
    typeof MutationObserver !== 'undefined'
  ) {
    rootThemeAttrObserver = new MutationObserver(notifyRootThemeAttrListeners);
    rootThemeAttrObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  return () => {
    rootThemeAttrListeners.delete(onStoreChange);
    if (rootThemeAttrListeners.size === 0 && rootThemeAttrObserver) {
      rootThemeAttrObserver.disconnect();
      rootThemeAttrObserver = null;
    }
  };
}

function subscribeNoop(): () => void {
  return () => {};
}

/**
 * Reads the root Theme's mode off `<html data-theme>`, live via the shared
 * MutationObserver. Null means no root Theme has synced it (none present,
 * or mode is 'system'). `hasCtx` switches which store this subscribes to —
 * a no-op store when a ThemeContext exists — instead of skipping the hook
 * call, so provider-path consumers never touch the DOM or the observer.
 */
function useRootThemeModeAttr(hasCtx: boolean): 'light' | 'dark' | null {
  return useSyncExternalStore(
    hasCtx ? subscribeNoop : subscribeRootThemeAttr,
    hasCtx ? getNullThemeMode : getRootThemeAttrSnapshot,
    getRootThemeAttrServerSnapshot,
  );
}

/**
 * Access the current Astryx theme's token values, resolved for the active color mode.
 *
 * Returns raw CSS values (hex colors, px values, etc.) suitable for
 * non-CSS consumers like canvas, SVG, or data visualization libraries
 * (e.g. Vega, D3, Chart.js) that need concrete values rather than
 * CSS custom property references.
 *
 * When called outside a <Theme> provider, resolves mode from the root
 * Theme's `<html data-theme>` when one is present, falling back to the
 * current system color mode otherwise.
 *
 * @example
 * ```
 * function Chart() {
 *   const { token, mode } = useTheme();
 *   return (
 *     <svg>
 *       <rect fill={token('--color-accent')} />
 *       <text fill={token('--color-text-primary')}>Sales</text>
 *     </svg>
 *   );
 * }
 * ```
 */
export function useTheme(): UseThemeReturn {
  const ctx = use(ThemeContext);

  // Falls back to the root Theme's mode via <html data-theme> when there's
  // no ThemeContext ancestor (e.g. useToast's detached fallback viewport).
  // Resolves to null when `ctx` is present, so it has no effect there.
  const rootAttrMode = useRootThemeModeAttr(ctx != null);

  // Resolve 'system' to 'light' | 'dark' using the OS preference
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const mode = ctx?.mode ?? rootAttrMode ?? 'system';
  const theme = ctx?.theme ?? null;

  const effectiveMode: 'light' | 'dark' =
    mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;

  // Build the full resolved map, memoized on theme + effective mode
  const tokens = useMemo(
    () => resolveThemeTokens(theme, {mode: effectiveMode}),
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
