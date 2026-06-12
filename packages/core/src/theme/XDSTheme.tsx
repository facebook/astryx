// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * XDSTheme Provider Component
 *
 * Applies theme tokens and sets color-scheme for light-dark() to work.
 * Themes are created with `defineTheme()` and applied via CSS:
 * - Token overrides set as CSS custom properties on [data-xds-theme]
 * - Component overrides scoped via @scope'd CSS selectors on stable XDS selectors
 *
 * Root detection: The first XDSTheme in the tree (no parent XDSTheme)
 * automatically syncs attributes to `document.documentElement`:
 * - `data-theme` — drives `color-scheme` via reset.css rules, ensuring browser
 *   chrome (scrollbars, native form controls, date pickers) reflects the mode.
 * - `data-xds-theme` — enables @scope'd theme CSS to reach elements rendered
 *   outside the XDSTheme wrapper (portals, toast fallback viewports).
 *
 * For RSC / SSR, set `data-theme` on `<html>` in your root server layout
 * to avoid a flash of wrong theme before hydration:
 *
 *   <html lang="en" data-theme="dark">
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

import React, {use, useId, useInsertionEffect, useMemo} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
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
// Nesting context — detect root vs nested XDSTheme
// =============================================================================

/**
 * Context to detect whether this XDSTheme is nested inside another.
 * The root provider (no parent context) syncs data-theme to <html>.
 * @internal
 */
const XDSThemeNestingContext = React.createContext(false);
XDSThemeNestingContext.displayName = 'XDSThemeNestingContext';

// =============================================================================
// Style injection for unbuilt themes
// =============================================================================

/** Track which themes have already been injected */
const injectedThemes = new Set<string>();

/** Track which themes have already logged the perf warning */
const warnedThemes = new Set<string>();

/**
 * Hook to inject theme CSS into the document.
 * Built themes (from `xds theme build`) skip injection — their CSS
 * is in a separate file imported by the consumer.
 */
function useThemeStyleInjection(theme: XDSDefinedTheme): void {
  const id = useId();

  useInsertionEffect(() => {
    // Built themes have their CSS in a separate file — skip injection
    if (theme.__built) {
      return;
    }

    const themeKey = `xds-theme-${theme.name}`;
    if (injectedThemes.has(themeKey)) {
      return;
    }

    // One-time perf hint per theme
    if (!warnedThemes.has(theme.name)) {
      warnedThemes.add(theme.name);
      console.warn(
        `[XDS] Theme "${theme.name}" is using runtime style injection. ` +
          `For better performance, use the pre-built theme:\n\n` +
          `  import {${theme.name}Theme} from '@xds/theme-${theme.name}/built';\n` +
          `  import '@xds/theme-${theme.name}/theme.css';\n\n` +
          `For custom themes, run \`npx xds theme build <file>\` to generate ` +
          `the built artifacts.`,
      );
    }

    const {prose, component} = generateThemeCSS(theme);
    if (!prose && !component) {
      return;
    }

    // Prose defaults go into @layer reset — lowest priority, scoped to
    // the theme region. Any class-based style (StyleX, .xds-*) wins.
    if (prose) {
      const proseStyle = document.createElement('style');
      proseStyle.setAttribute('data-xds-theme-prose', theme.name);
      proseStyle.setAttribute('data-xds-id', id);
      proseStyle.textContent = `@layer reset {\n${prose}\n}`;
      document.head.appendChild(proseStyle);
    }

    // Component overrides go into @layer xds-theme — above StyleX layers
    // so themes can intentionally restyle components.
    if (component) {
      const compStyle = document.createElement('style');
      compStyle.setAttribute('data-xds-theme', theme.name);
      compStyle.setAttribute('data-xds-id', id);
      compStyle.textContent = `@layer xds-theme {\n${component}\n}`;
      document.head.appendChild(compStyle);
    }

    injectedThemes.add(themeKey);

    return () => {
      // Remove both prose and component style tags
      const proseEl = document.querySelector(
        `style[data-xds-theme-prose="${theme.name}"][data-xds-id="${id}"]`,
      );
      const compEl = document.querySelector(
        `style[data-xds-theme="${theme.name}"][data-xds-id="${id}"]`,
      );
      proseEl?.remove();
      compEl?.remove();
      injectedThemes.delete(themeKey);
    };
  }, [theme, id]);
}

// =============================================================================
// Root color-scheme sync
// =============================================================================

/**
 * Hook to sync theme attributes to document.documentElement for the root provider.
 * Skipped for nested XDSTheme instances.
 *
 * Syncs two attributes:
 * - `data-theme` (light/dark) — reset.css maps this to color-scheme, controlling
 *   browser chrome (scrollbars, native form controls, date pickers).
 * - `data-xds-theme` (theme name) — enables @scope'd theme CSS to reach elements
 *   outside the XDSTheme wrapper (e.g. toast fallback viewports, portals).
 *
 * - 'light' | 'dark' → sets data-theme="light" | "dark"
 * - 'system' → removes data-theme (reset.css defaults to color-scheme: light dark)
 */
function useRootThemeSync(
  isNested: boolean,
  mode: ThemeMode,
  themeName: string,
): void {
  useIsomorphicLayoutEffect(() => {
    if (isNested) {
      return;
    }
    if (typeof document === 'undefined') {
      return;
    }

    if (mode === 'light' || mode === 'dark') {
      document.documentElement.setAttribute('data-theme', mode);
    } else {
      // system — remove attribute, let reset.css default apply
      document.documentElement.removeAttribute('data-theme');
    }

    // Sync theme name so @scope rules reach portals/fallback viewports
    document.documentElement.setAttribute('data-xds-theme', themeName);

    return () => {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.removeAttribute('data-xds-theme');
    };
  }, [isNested, mode, themeName]);
}

// =============================================================================
// Component
// =============================================================================

/**
 * XDSTheme provider component
 *
 * Sets data-xds-theme attribute so @scope'd CSS takes effect.
 * Component overrides are pure CSS scoped under the theme attribute —
 * components render stable xds-* classes plus reflected data-* attributes and
 * don't need context.
 *
 * When this is the root XDSTheme (no parent XDSTheme in the tree),
 * it syncs `data-theme` and `data-xds-theme` to `<html>` so browser
 * chrome reflects the active mode and @scope'd CSS reaches portals.
 * Nested XDSTheme instances skip the sync.
 */
export function XDSTheme({
  theme,
  mode = 'system',
  children,
}: XDSThemeProps): React.ReactElement {
  const isNested = use(XDSThemeNestingContext);

  useThemeStyleInjection(theme);
  useRootThemeSync(isNested, mode, theme.name);

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
    <XDSThemeContext value={ctxValue}>
      <XDSThemeNestingContext value={true}>
        <div
          {...stylex.props(wrapperStyles.base, colorSchemeStyle)}
          data-xds-theme={theme.name}
          data-theme={mode === 'system' ? undefined : mode}>
          {children}
        </div>
      </XDSThemeNestingContext>
    </XDSThemeContext>
  );
}

XDSTheme.displayName = 'XDSTheme';
