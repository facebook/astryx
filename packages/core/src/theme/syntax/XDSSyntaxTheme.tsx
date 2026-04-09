"use client";

/**
 * @file XDSSyntaxTheme.tsx
 * @input SyntaxTheme from defineSyntaxTheme.ts
 * @output XDSSyntaxTheme provider, useXDSSyntaxTheme hook
 * @position Provider component; wraps code surfaces to apply syntax coloring
 *
 * @see https://github.com/facebookexperimental/xds/issues/1148
 */

import React, {createContext, useContext, useMemo} from 'react';
import {
  syntaxThemeStyle,
  resolveSyntaxTokenForMode,
  ALL_SYNTAX_KEYS,
  type SyntaxTheme,
  type SyntaxThemeTokenKey,
} from './defineSyntaxTheme';
import {useMediaQuery} from '../../hooks/useMediaQuery';

// =============================================================================
// Context
// =============================================================================

/** @internal */
interface SyntaxThemeContextValue {
  theme: SyntaxTheme;
}

const SyntaxThemeContext = createContext<SyntaxThemeContextValue | null>(null);

// =============================================================================
// Return type
// =============================================================================

export interface UseXDSSyntaxThemeReturn {
  /** Syntax theme name */
  name: string;
  /** Resolved effective mode ('light' | 'dark') */
  mode: 'light' | 'dark';
  /**
   * Resolve a syntax token to its raw CSS value for the current color mode.
   *
   * @example
   * const keywordColor = token('keyword'); // "#0064E0" in light mode
   */
  token: (name: SyntaxThemeTokenKey) => string;
  /**
   * All syntax tokens resolved for the current color mode.
   */
  tokens: Record<SyntaxThemeTokenKey, string>;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Access the current syntax theme's token values, resolved for the active
 * color mode. Returns null if no XDSSyntaxTheme provider is present.
 *
 * @example
 * function CodeCanvas() {
 *   const syntax = useXDSSyntaxTheme();
 *   if (!syntax) return null;
 *   ctx.fillStyle = syntax.token('keyword');
 * }
 */
export function useXDSSyntaxTheme(): UseXDSSyntaxThemeReturn | null {
  const ctx = useContext(SyntaxThemeContext);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const effectiveMode: 'light' | 'dark' = prefersDark ? 'dark' : 'light';

  const tokens = useMemo(() => {
    if (!ctx) return null;
    const resolved = {} as Record<SyntaxThemeTokenKey, string>;
    for (const key of ALL_SYNTAX_KEYS) {
      resolved[key] = resolveSyntaxTokenForMode(
        ctx.theme.__inputTokens[key],
        effectiveMode,
      );
    }
    return resolved;
  }, [ctx, effectiveMode]);

  if (!ctx || !tokens) return null;

  return {
    name: ctx.theme.name,
    mode: effectiveMode,
    token: (name: SyntaxThemeTokenKey) => tokens[name] ?? '',
    tokens,
  };
}

// =============================================================================
// Component
// =============================================================================

interface XDSSyntaxThemeProps {
  theme: SyntaxTheme;
  children: React.ReactNode;
}

/**
 * Syntax theme provider. Sets CSS custom properties on a wrapper div
 * so child code components inherit via cascade.
 */
export function XDSSyntaxTheme({
  theme,
  children,
}: XDSSyntaxThemeProps): React.ReactElement {
  const style = useMemo(() => syntaxThemeStyle(theme), [theme]);
  const value = useMemo(() => ({theme}), [theme]);

  return (
    <SyntaxThemeContext.Provider value={value}>
      <div style={style} data-xds-syntax-theme={theme.name}>
        {children}
      </div>
    </SyntaxThemeContext.Provider>
  );
}

XDSSyntaxTheme.displayName = 'XDSSyntaxTheme';
