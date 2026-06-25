// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MediaTheme.tsx
 * @input mode prop ("dark" | "light") + children
 * @output Wrapper div that creates an inverted theming context
 * @position Theme system component; sibling to Theme
 *
 * Provides semantic token overrides for content rendered on a surface
 * with a different luminance than the page background. Used by Toast,
 * Tooltip, and other components that render on inverted surfaces.
 *
 * How it works:
 * 1. Sets `data-astryx-media="dark|light"` — the theme's generated CSS
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
 * ```
 * <div style={{ backgroundColor: 'var(--color-background-inverted)' }}>
 *   <MediaTheme mode="dark">
 *     <Button label="Undo" variant="ghost" />
 *   </MediaTheme>
 * </div>
 * ```
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from './tokens.stylex';
import {dataAttr} from '../naming';

const styles = stylex.create({
  root: {
    display: 'contents',
    color: colorVars['--color-text-primary'],
  },
});

export interface MediaThemeProps {
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
 * Wraps children with `data-astryx-media` — the theme's CSS targets this
 * attribute to apply inverted tokens. Parent component overrides flow
 * through unchanged; only tokens change for the surface context.
 */
export function MediaTheme({
  mode,
  children,
}: MediaThemeProps): React.ReactElement {
  return (
    <div
      {...{[dataAttr('media')]: mode}}
      {...stylex.props(styles.root)}
    >
      {children}
    </div>
  );
}

MediaTheme.displayName = 'MediaTheme';
