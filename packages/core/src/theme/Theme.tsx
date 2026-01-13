/**
 * Theme Provider Component
 *
 * Applies StyleX theme and sets color-scheme for light-dark() to work.
 *
 * Usage:
 * ```tsx
 * <Theme theme={myTheme}>
 *   <App />
 * </Theme>
 *
 * // With mode override
 * <Theme theme={myTheme} mode="dark">
 *   <App />
 * </Theme>
 * ```
 */

import React, { createContext, useContext, useMemo } from 'react';
import * as stylex from '@stylexjs/stylex';
import type { Theme as ThemeType, ThemeMode } from './types';

/**
 * Theme context value
 */
interface ThemeContextValue {
  theme: ThemeType;
  mode: ThemeMode;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Hook to access current theme
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a Theme provider');
  }
  return context;
}

/**
 * Theme provider props
 */
interface ThemeProps {
  /** Theme created by createTheme() */
  theme: ThemeType;
  /** Color mode - 'system' follows OS preference */
  mode?: ThemeMode;
  /** Children to render */
  children: React.ReactNode;
}

/**
 * Styles for the theme wrapper
 */
const wrapperStyles = stylex.create({
  base: {
    display: 'contents',
  },
  light: {
    colorScheme: 'light',
  },
  dark: {
    colorScheme: 'dark',
  },
  system: {
    colorScheme: 'light dark',
  },
});

/**
 * Convert runtime overrides to CSS style object
 */
function overridesToStyle(overrides: Record<string, string>): React.CSSProperties {
  const style: Record<string, string> = {};
  for (const [varName, value] of Object.entries(overrides)) {
    style[varName] = value;
  }
  return style as React.CSSProperties;
}

/**
 * Theme provider component
 *
 * Applies StyleX theme variables and sets color-scheme for light-dark() to work.
 * Use mode prop to override system preference.
 */
export function Theme({
  theme,
  mode = 'system',
  children,
}: ThemeProps): React.ReactElement {
  const contextValue = useMemo(() => ({ theme, mode }), [theme, mode]);

  // Get the color-scheme style based on mode
  const colorSchemeStyle =
    mode === 'dark' ? wrapperStyles.dark :
    mode === 'light' ? wrapperStyles.light :
    wrapperStyles.system;

  // Get StyleX props for all theme styles
  const stylexProps = stylex.props(
    wrapperStyles.base,
    colorSchemeStyle,
    theme.colorTheme,
    theme.elevationTheme
  );

  // Convert runtime overrides to inline styles
  const overrideStyles = useMemo(
    () => overridesToStyle(theme.overrides),
    [theme.overrides]
  );

  // Merge StyleX styles with runtime overrides
  const mergedStyle = {
    ...stylexProps.style,
    ...overrideStyles,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <div
        className={stylexProps.className}
        style={mergedStyle}
        data-theme={mode === 'system' ? undefined : mode}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
