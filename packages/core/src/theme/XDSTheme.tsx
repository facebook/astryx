/**
 * XDSTheme Provider Component
 *
 * Applies theme tokens and sets color-scheme for light-dark() to work.
 * Supports two theme types:
 * - XDSDefinedTheme (from defineTheme): generates CSS or uses pre-built styles
 * - Legacy Theme (StyleX): applies StyleX theme styles directly
 *
 * With defineTheme, components get their overrides via CSS (e.g. .xds-button)
 * scoped under the theme's data-xds-theme attribute — no context reads needed.
 * This unlocks RSC for all components.
 *
 * Usage:
 * ```tsx
 * // New API — defineTheme
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
 * import '@xds/theme-ocean/styles.css';
 * <XDSTheme theme={oceanTheme}><App /></XDSTheme>
 *
 * // Legacy API — StyleX theme object (still supported)
 * <XDSTheme theme={defaultTheme}><App /></XDSTheme>
 * ```
 */

'use client';

import React, {useContext, useMemo, useId, useInsertionEffect} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {Theme as LegacyTheme, ThemeMode} from './types';
import {ThemeContext, type ThemeContextValue} from './ThemeContext';
import {colorVars, typographyVars} from './tokens.stylex';
import {IconRegistryContext} from '../Icon/IconRegistry';
import {
  isDefinedTheme,
  generateThemeCSS,
  type XDSDefinedTheme,
} from './defineTheme';

// Re-export for backwards compatibility
export {ThemeContext} from './ThemeContext';

/**
 * Hook to access current theme
 */
export function useXDSTheme(): ThemeContextValue | null {
  return useContext(ThemeContext);
}

/** @deprecated Use useXDSTheme instead */
export const useTheme = useXDSTheme;

/**
 * XDSTheme provider props
 */
interface XDSThemeProps {
  /** Theme — from defineTheme() or a legacy StyleX theme object */
  theme: XDSDefinedTheme | LegacyTheme;
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
 * Always called (React rules of hooks) but only does work for unbuilt
 * XDSDefinedTheme instances.
 */
function useThemeStyleInjection(
  theme: XDSDefinedTheme | LegacyTheme,
  defined: boolean,
): void {
  const id = useId();

  useInsertionEffect(() => {
    // Only inject for unbuilt XDSDefinedTheme instances
    if (!defined) return;

    const dt = theme as XDSDefinedTheme;

    // Built themes have their CSS in a separate file — skip injection
    if (dt.__built) return;

    const themeKey = `xds-theme-${dt.name}`;
    if (injectedThemes.has(themeKey)) return;

    const css = generateThemeCSS(dt);
    if (!css) return;

    const style = document.createElement('style');
    style.setAttribute('data-xds-theme', dt.name);
    style.setAttribute('data-xds-id', id);
    style.textContent = `@layer xds.theme {\n${css}\n}`;
    document.head.appendChild(style);
    injectedThemes.add(themeKey);

    return () => {
      const existing = document.querySelector(
        `style[data-xds-theme="${dt.name}"][data-xds-id="${id}"]`,
      );
      if (existing) {
        existing.remove();
        injectedThemes.delete(themeKey);
      }
    };
  }, [theme, defined, id]);
}

// =============================================================================
// Component
// =============================================================================

/**
 * XDSTheme provider component
 *
 * For defineTheme themes: sets data-xds-theme attribute so @scope'd CSS
 * takes effect. Component overrides are pure CSS scoped under the theme
 * attribute — components just render with their .xds-* class and don't
 * need context. This enables RSC for all components.
 *
 * For legacy themes: applies StyleX theme styles via context (existing behavior).
 */
export function XDSTheme({
  theme,
  mode = 'system',
  children,
}: XDSThemeProps): React.ReactElement {
  const defined = isDefinedTheme(theme);

  // Always call the hook (React rules) — it no-ops for legacy themes
  useThemeStyleInjection(theme, defined);

  // Build context value (still needed for legacy themes and useXDSTheme hook)
  const contextValue = useMemo(() => {
    if (defined) {
      const dt = theme as XDSDefinedTheme;
      const legacyTheme: LegacyTheme = {
        name: dt.name,
        styles: {},
        icons: dt.icons,
        raw: {},
      };
      return {theme: legacyTheme, mode};
    }
    return {theme: theme as LegacyTheme, mode};
  }, [theme, mode, defined]);

  // Get color-scheme style
  const colorSchemeStyle =
    mode === 'dark'
      ? wrapperStyles.dark
      : mode === 'light'
        ? wrapperStyles.light
        : wrapperStyles.system;

  // StyleX props — defined themes only need base + color scheme,
  // legacy themes also apply all token group styles
  const stylexProps = defined
    ? stylex.props(wrapperStyles.base, colorSchemeStyle)
    : stylex.props(
        wrapperStyles.base,
        colorSchemeStyle,
        (theme as LegacyTheme).styles.colors,
        (theme as LegacyTheme).styles.spacing,
        (theme as LegacyTheme).styles.size,
        (theme as LegacyTheme).styles.radius,
        (theme as LegacyTheme).styles.elevation,
        (theme as LegacyTheme).styles.transition,
        (theme as LegacyTheme).styles.typography,
        (theme as LegacyTheme).styles.textSize,
        (theme as LegacyTheme).styles.lineHeight,
        (theme as LegacyTheme).styles.fontWeight,
      );

  // Icons — from either theme type
  const icons = defined
    ? (theme as XDSDefinedTheme).icons
    : (theme as LegacyTheme).icons;

  let content: React.ReactNode = children;
  if (icons != null) {
    content = (
      <IconRegistryContext.Provider value={icons}>
        {content}
      </IconRegistryContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <div
        {...stylexProps}
        data-xds-theme={
          defined
            ? (theme as XDSDefinedTheme).name
            : (theme as LegacyTheme).name
        }
        data-theme={mode === 'system' ? undefined : mode}>
        {content}
      </div>
    </ThemeContext.Provider>
  );
}

XDSTheme.displayName = 'XDSTheme';

/** @deprecated Use XDSTheme instead */
export const Theme = XDSTheme;
