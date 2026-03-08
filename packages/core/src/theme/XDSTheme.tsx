/**
 * XDSTheme Provider Component
 *
 * Applies theme tokens and sets color-scheme for light-dark() to work.
 * Themes are created with `defineTheme()` and applied via CSS:
 * - Token overrides set as CSS custom properties on [data-xds-theme]
 * - Component overrides scoped via @scope'd CSS selectors on .xds-* classes
 *
 * Usage:
 * ```
 * const ocean = defineTheme({
 *   name: 'ocean',
 *   tokens: { '--color-accent': ['#0077B6', '#48CAE4'] },
 *   components: { card: { base: { borderWidth: '2px' } } },
 *   icons: oceanIcons,
 * });
 * <XDSTheme theme={ocean}><App /></XDSTheme>
 *
 * // Built theme — CSS imported separately
 * import { oceanTheme } from '@xds/theme-ocean';
 * import '@xds/theme-ocean/theme.css';
 * <XDSTheme theme={oceanTheme}><App /></XDSTheme>
 * ```
 */

'use client';

import React, {useId, useInsertionEffect} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {ThemeMode} from './types';
import {colorVars, typographyVars} from './tokens.stylex';
import {registerIcons} from '../Icon/globalIconRegistry';
import {generateThemeCSS, type XDSDefinedTheme} from './defineTheme';

/**
 * XDSTheme provider props
 */
interface XDSThemeProps {
  /** Theme from defineTheme() */
  theme: XDSDefinedTheme;
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

// =============================================================================
// Style injection for unbuilt themes
// =============================================================================

/** Track which themes have already been injected */
const injectedThemes = new Set<string>();

/**
 * Hook to inject theme CSS into the document.
 * Built themes (from `xds build-theme`) skip injection — their CSS
 * is in a separate file imported by the consumer.
 */
function useThemeStyleInjection(theme: XDSDefinedTheme): void {
  const id = useId();

  useInsertionEffect(() => {
    // Built themes have their CSS in a separate file — skip injection
    if (theme.__built) return;

    const themeKey = `xds-theme-${theme.name}`;
    if (injectedThemes.has(themeKey)) return;

    const css = generateThemeCSS(theme);
    if (!css) return;

    const style = document.createElement('style');
    style.setAttribute('data-xds-theme', theme.name);
    style.setAttribute('data-xds-id', id);
    style.textContent = `@layer xds.theme {\n${css}\n}`;
    document.head.appendChild(style);
    injectedThemes.add(themeKey);

    return () => {
      const existing = document.querySelector(
        `style[data-xds-theme="${theme.name}"][data-xds-id="${id}"]`,
      );
      if (existing) {
        existing.remove();
        injectedThemes.delete(themeKey);
      }
    };
  }, [theme, id]);
}

// =============================================================================
// Component
// =============================================================================

/**
 * XDSTheme provider component
 *
 * Sets data-xds-theme attribute so @scope'd CSS takes effect.
 * Component overrides are pure CSS scoped under the theme attribute —
 * components render with their .xds-* class and don't need context.
 */
export function XDSTheme({
  theme,
  mode = 'system',
  children,
}: XDSThemeProps): React.ReactElement {
  useThemeStyleInjection(theme);

  // Get color-scheme style
  const colorSchemeStyle =
    mode === 'dark'
      ? wrapperStyles.dark
      : mode === 'light'
        ? wrapperStyles.light
        : wrapperStyles.system;

  // Icons — register globally (works in both server and client environments)
  const icons = theme.icons;
  if (icons != null) {
    registerIcons(icons);
  }

  return (
    <div
      {...stylex.props(wrapperStyles.base, colorSchemeStyle)}
      data-xds-theme={theme.name}
      data-theme={mode === 'system' ? undefined : mode}>
      {children}
    </div>
  );
}

XDSTheme.displayName = 'XDSTheme';
