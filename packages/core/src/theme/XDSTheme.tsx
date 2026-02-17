/**
 * XDSTheme Provider Component
 *
 * Applies StyleX theme and sets color-scheme for light-dark() to work.
 *
 * Usage:
 * ```tsx
 * <XDSTheme theme={myTheme}>
 *   <App />
 * </XDSTheme>
 *
 * // With mode override
 * <XDSTheme theme={myTheme} mode="dark">
 *   <App />
 * </XDSTheme>
 * ```
 */

import React, {useContext, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {Theme as ThemeType, ThemeMode} from './types';
import {ThemeContext, type ThemeContextValue} from './ThemeContext';
import {colorVars, typographyVars} from './tokens.stylex';

// Re-export for backwards compatibility
export {ThemeContext} from './ThemeContext';

/**
 * Hook to access current theme
 */
export function useXDSTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useXDSTheme must be used within an XDSTheme provider');
  }
  return context;
}

/** @deprecated Use useXDSTheme instead */
export const useTheme = useXDSTheme;

/**
 * XDSTheme provider props
 */
interface XDSThemeProps {
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
    color: colorVars['--color-text-primary'],
    fontFamily: typographyVars['--font-body'],
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
 * XDSTheme provider component
 *
 * Applies StyleX theme variables and sets color-scheme for light-dark() to work.
 * Use mode prop to override system preference.
 */
export function XDSTheme({
  theme,
  mode = 'system',
  children,
}: XDSThemeProps): React.ReactElement {
  const contextValue = useMemo(() => ({theme, mode}), [theme, mode]);

  // Get the color-scheme style based on mode
  const colorSchemeStyle =
    mode === 'dark'
      ? wrapperStyles.dark
      : mode === 'light'
        ? wrapperStyles.light
        : wrapperStyles.system;

  // Get StyleX props for all theme styles
  const stylexProps = stylex.props(
    wrapperStyles.base,
    colorSchemeStyle,
    theme.styles.colors,
    theme.styles.spacing,
    theme.styles.size,
    theme.styles.radius,
    theme.styles.elevation,
    theme.styles.transition,
    theme.styles.typography,
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <div
        className={stylexProps.className}
        style={stylexProps.style}
        data-theme={mode === 'system' ? undefined : mode}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/** @deprecated Use XDSTheme instead */
export const Theme = XDSTheme;
