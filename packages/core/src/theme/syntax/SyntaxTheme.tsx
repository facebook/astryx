// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SyntaxTheme.tsx
 * @input SyntaxTheme from defineSyntaxTheme.ts
 * @output SyntaxTheme provider, useSyntaxTheme hook
 * @position Provider component; wraps code surfaces to apply syntax coloring
 *
 * @see https://github.com/facebook/astryx/issues/1148
 */

import React, {createContext, use, useMemo} from 'react';
import {
  syntaxThemeStyle,
  resolveSyntaxTokenForMode,
  ALL_SYNTAX_KEYS,
  type SyntaxThemeDefinition,
  type SyntaxThemeTokenKey,
} from './defineSyntaxTheme';
import {useMediaQuery} from '../../hooks/useMediaQuery';

// =============================================================================
// Context
// =============================================================================

/** @internal */
interface SyntaxThemeContextValue {
  theme: SyntaxThemeDefinition;
}

const SyntaxThemeContext = createContext<SyntaxThemeContextValue | null>(null);
SyntaxThemeContext.displayName = 'SyntaxThemeContext';

// =============================================================================
// Return type
// =============================================================================

export interface UseSyntaxThemeReturn {
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
 * color mode. Returns null if no SyntaxTheme provider is present.
 *
 * @example
 * function CodeCanvas() {
 *   const syntax = useSyntaxTheme();
 *   if (!syntax) {
 *     return null;
 *   }
 *   ctx.fillStyle = syntax.token('keyword');
 * }
 */
export function useSyntaxTheme(): UseSyntaxThemeReturn | null {
  const ctx = use(SyntaxThemeContext);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const effectiveMode: 'light' | 'dark' = prefersDark ? 'dark' : 'light';

  const tokens = useMemo(() => {
    if (!ctx) {
      return null;
    }
    const resolved: Partial<Record<SyntaxThemeTokenKey, string>> = {};
    for (const key of ALL_SYNTAX_KEYS) {
      resolved[key] = resolveSyntaxTokenForMode(
        ctx.theme.__inputTokens[key],
        effectiveMode,
      );
    }
    return resolved as Record<SyntaxThemeTokenKey, string>;
  }, [ctx, effectiveMode]);

  if (!ctx || !tokens) {
    return null;
  }

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

interface SyntaxThemeProps {
  theme: SyntaxThemeDefinition;
  children: React.ReactNode;
}

/**
 * Syntax theme provider. Sets CSS custom properties on a wrapper div
 * so child code components inherit via cascade.
 */
export function SyntaxTheme({
  theme,
  children,
}: SyntaxThemeProps): React.ReactElement {
  const style = useMemo(() => syntaxThemeStyle(theme), [theme]);
  const value = useMemo(() => ({theme}), [theme]);

  return (
    <SyntaxThemeContext value={value}>
      <div style={style} data-astryx-syntax-theme={theme.name}>
        {children}
      </div>
    </SyntaxThemeContext>
  );
}

SyntaxTheme.displayName = 'SyntaxTheme';
