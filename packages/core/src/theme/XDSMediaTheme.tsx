'use client';

/**
 * @file XDSMediaTheme.tsx
 * @input mode prop ("dark" | "light") + children
 * @output Wrapper div that creates an inverted theming context
 * @position Theme system component; sibling to XDSTheme
 *
 * Provides semantic token overrides for content rendered on a surface
 * with a different luminance than the page background. Used by Toast,
 * Tooltip, and other components that render on inverted surfaces.
 *
 * How it works:
 * 1. Sets `data-xds-media="dark|light"` — the theme's generated CSS
 *    targets this to apply token overrides (including color-scheme).
 * 2. Parent theme's component overrides pass through — structural
 *    styling (border-radius, font-weight, etc.) is preserved.
 *    Only tokens (colors, overlays, borders) change for the surface.
 * 3. Themes can further customize components on media surfaces via
 *    `onDark.components` / `onLight.components` in defineTheme().
 * 4. Children (Button, Link, Text, etc.) pick up inverted tokens
 *    naturally through CSS custom property inheritance
 *
 * @example
 * ```tsx
 * // Dark surface (e.g. toast on a light page)
 * <div style={{ backgroundColor: 'var(--color-background-inverted)' }}>
 *   <XDSMediaTheme mode="dark">
 *     <XDSButton label="Undo" variant="ghost" />
 *   </XDSMediaTheme>
 * </div>
 * ```
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from './tokens.stylex';

const styles = stylex.create({
  root: {
    display: 'contents',
    color: colorVars['--color-text-primary'],
  },
});

export interface XDSMediaThemeProps {
  /**
   * The surface luminance context for children.
   * - `"dark"` — children are on a dark background (get light text/icons)
   * - `"light"` — children are on a light background (get dark text/icons)
   */
  mode: 'dark' | 'light';
  /** Content to render in the media context */
  children: React.ReactNode;
}

/**
 * Inverted surface theming context.
 *
 * Wraps children with `data-xds-media` — the theme's CSS targets this
 * attribute to apply inverted tokens. Parent component overrides flow
 * through unchanged; only tokens change for the surface context.
 */
export function XDSMediaTheme({
  mode,
  children,
}: XDSMediaThemeProps): React.ReactElement {
  return (
    <div data-xds-media={mode} {...stylex.props(styles.root)}>
      {children}
    </div>
  );
}

XDSMediaTheme.displayName = 'XDSMediaTheme';
