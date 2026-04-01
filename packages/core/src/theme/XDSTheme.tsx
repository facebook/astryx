'use client';

/**
 * XDSTheme Provider Component
 *
 * Applies theme tokens and sets color-scheme for light-dark() to work.
 * Themes are created with `defineTheme()` and applied via CSS:
 * - Token overrides set as CSS custom properties on [data-xds-theme]
 * - Component overrides scoped via @scope'd CSS selectors on .xds-* classes
 *
 * @example
 * ```
 * const ocean = defineTheme({
 *   name: 'ocean',
 *   tokens: { '--color-accent': ['#0077B6', '#48CAE4'] },
 *   components: { card: { base: { borderWidth: '2px' } } },
 *   icons: oceanIcons,
 * });
 * <XDSTheme theme={ocean}><App /></XDSTheme>
 * ```
 */

import React, {
  useId,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {ThemeMode} from './types';
import {colorVars, typographyVars} from './tokens.stylex';
import {registerIcons} from '../Icon/globalIconRegistry';
import {generateThemeCSS, type XDSDefinedTheme} from './defineTheme';
import {XDSThemeContext} from './useXDSTheme';

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
    fontFamily: typographyVars['--font-family-body'],
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
 * Built themes (from `xds theme build`) skip injection — their CSS
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
    style.textContent = `@layer xds-theme {\n${css}\n}`;
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
// Font loading for themes that declare fonts
// =============================================================================

/**
 * Hook that loads fonts declared in theme.fonts at runtime.
 *
 * Uses useLayoutEffect to inject font stylesheets before the browser paints,
 * minimizing flash of unstyled text (FOUT).
 *
 * This is the fallback loading path — the preferred approach is to add
 * <link rel="stylesheet" href="..."> to your document <head>. For discoverability,
 * `npx xds theme build` prints font instructions in the build output.
 *
 * A console warning is logged for each font loaded at runtime
 * to encourage moving to the preload path.
 */
function useThemeFontLoading(theme: XDSDefinedTheme): void {
  const injectedLinksRef = useRef<HTMLLinkElement[]>([]);

  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;
    if (!theme.fonts || theme.fonts.length === 0) return;

    const newLinks: HTMLLinkElement[] = [];

    for (const font of theme.fonts) {
      // Check if font is already loaded
      const isLoaded = document.fonts.check(`16px "${font.family}"`);
      if (isLoaded) continue;

      // Check if we already injected a link for this URL
      const existing = document.head.querySelector(
        `link[rel="stylesheet"][href="${font.url}"]`,
      );
      if (existing) continue;

      // Inject the font stylesheet
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = font.url;
      document.head.appendChild(link);
      newLinks.push(link);

      // Dev-mode warning to encourage preloading
      // Warn to encourage preloading — only visible in devtools
      console.warn(
        `[XDS] Theme "${theme.name}" loaded font "${font.family}" at runtime. ` +
          `For better performance, add to your document <head>:\n` +
          `  <link rel="stylesheet" href="${font.url}" />`,
      );
    }

    injectedLinksRef.current = newLinks;

    return () => {
      for (const link of injectedLinksRef.current) {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      }
      injectedLinksRef.current = [];
    };
  }, [theme.fonts, theme.name]);
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
  useThemeFontLoading(theme);

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

  // Memoize the context value to prevent unnecessary re-renders
  const ctxValue = useMemo(() => ({theme, mode}), [theme, mode]);

  return (
    <XDSThemeContext.Provider value={ctxValue}>
      <div
        {...stylex.props(wrapperStyles.base, colorSchemeStyle)}
        data-xds-theme={theme.name}
        data-theme={mode === 'system' ? undefined : mode}>
        {children}
      </div>
    </XDSThemeContext.Provider>
  );
}

XDSTheme.displayName = 'XDSTheme';
