/**
 * @file XDSCommandPaletteGroup.tsx
 * @input Uses React, StyleX
 * @output Exports XDSCommandPaletteGroup component
 * @position Sub-component; visual grouping with heading
 *
 * SYNC: When modified, update:
 * - /packages/core/src/CommandPalette/README.md
 * - /packages/core/src/CommandPalette/index.ts
 */

'use client';

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  textSizeVars,
  typographyVars,
  fontWeightVars,
} from '../../../../core/src/theme/tokens.stylex';

const styles = stylex.create({
  group: {
    paddingBlock: spacingVars['--spacing-1'],
  },
  heading: {
    paddingInline: spacingVars['--spacing-3'],
    paddingBlock: spacingVars['--spacing-1'],
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-xsm'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-secondary'],
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    userSelect: 'none',
  },
});

export interface XDSCommandPaletteGroupProps {
  /**
   * Group heading text.
   */
  heading: string;

  /**
   * Items within this group.
   */
  children: ReactNode;

  /**
   * StyleX overrides for the group container.
   */
  xstyle?: StyleXStyles;
}

/**
 * Visual grouping for command palette items with a heading label.
 *
 * @compositionHint Place inside XDSCommandPaletteList.
 *   Contains XDSCommandPaletteItem children.
 *
 * @example
 * ```
 * <XDSCommandPaletteGroup heading="Navigation">
 *   <XDSCommandPaletteItem value="home" onSelect={goHome}>
 *     Home
 *   </XDSCommandPaletteItem>
 * </XDSCommandPaletteGroup>
 * ```
 */
export function XDSCommandPaletteGroup({
  heading,
  children,
  xstyle,
}: XDSCommandPaletteGroupProps) {
  return (
    <div
      role="group"
      aria-label={heading}
      {...stylex.props(styles.group, xstyle)}>
      <div aria-hidden="true" {...stylex.props(styles.heading)}>
        {heading}
      </div>
      {children}
    </div>
  );
}

XDSCommandPaletteGroup.displayName = 'XDSCommandPaletteGroup';
