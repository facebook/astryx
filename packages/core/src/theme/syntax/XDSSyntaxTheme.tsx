"use client";

/**
 * @file XDSSyntaxTheme.tsx
 * @input XDSSyntaxTheme type from defineSyntaxTheme.ts
 * @output XDSSyntaxTheme provider, useSyntaxTheme hook
 * @position Provider component; wraps code surfaces to apply syntax coloring
 *
 * Sets syntax color tokens as CSS custom properties on a wrapper element.
 * Any XDSCodeBlock or XDSCodeEditor inside inherits these colors via
 * CSS variable cascade.
 *
 * Cascading priority (highest wins):
 * 1. syntaxTheme prop on individual code components (inline style)
 * 2. XDSSyntaxTheme provider (closer ancestor)
 * 3. syntax field in defineTheme() (theme root)
 * 4. Built-in XDS default syntax token values (CSS fallbacks)
 *
 * @see https://github.com/facebookexperimental/xds/issues/1148
 */

import React, {createContext, useContext, useMemo} from 'react';
import {syntaxThemeStyle, type SyntaxTheme} from './defineSyntaxTheme';

// =============================================================================
// Context
// =============================================================================

const SyntaxThemeContext = createContext<SyntaxTheme | null>(null);

/**
 * Read the current syntax theme from context.
 * Returns null if no XDSSyntaxTheme provider is present.
 */
export function useSyntaxTheme(): SyntaxTheme | null {
  return useContext(SyntaxThemeContext);
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
 * so child code components inherit via cascade. Also exposes the theme
 * object via React context for programmatic access.
 */
export function XDSSyntaxTheme({
  theme,
  children,
}: XDSSyntaxThemeProps): React.ReactElement {
  const style = useMemo(() => syntaxThemeStyle(theme), [theme]);

  return (
    <SyntaxThemeContext.Provider value={theme}>
      <div style={style} data-xds-syntax-theme={theme.name}>
        {children}
      </div>
    </SyntaxThemeContext.Provider>
  );
}

XDSSyntaxTheme.displayName = 'XDSSyntaxTheme';
