// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSCommandPaletteEmpty.tsx
 * @input Uses React, StyleX
 * @output Exports XDSCommandPaletteEmpty component
 * @position Sub-component; empty state shown when there are no items to display
 *
 * SYNC: When modified, update:
 * - /packages/cli/templates/blocks/components/CommandPalette/ (showcase blocks)
 */

'use client';

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from '../theme/tokens.stylex';

const styles = stylex.create({
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: spacingVars['--spacing-8'],
    paddingInline: spacingVars['--spacing-4'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
    textAlign: 'center' as const,
  },
});

export interface XDSCommandPaletteEmptyProps {
  /** The message or content to display. */
  children: ReactNode;
}

/**
 * Empty state for the command palette list area.
 *
 * Rendered automatically by XDSCommandPalette in two situations:
 * - `emptyBootstrapText`: no search term and bootstrap() returns nothing
 * - `emptySearchText`: a search query returned no results
 *
 * Can also be composed manually inside a custom render function.
 *
 * @example
 * ```
 * <XDSCommandPalette
 *   emptyBootstrapText={<XDSCommandPaletteEmpty>Start typing to search</XDSCommandPaletteEmpty>}
 *   emptySearchText={<XDSCommandPaletteEmpty>No results found</XDSCommandPaletteEmpty>}
 *   searchSource={source}
 * />
 * ```
 */
export function XDSCommandPaletteEmpty({
  children,
}: XDSCommandPaletteEmptyProps) {
  return <div {...stylex.props(styles.empty)}>{children}</div>;
}

XDSCommandPaletteEmpty.displayName = 'XDSCommandPaletteEmpty';
