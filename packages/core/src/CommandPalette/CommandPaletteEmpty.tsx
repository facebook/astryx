// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandPaletteEmpty.tsx
 * @input Uses React, StyleX
 * @output Exports CommandPaletteEmpty component
 * @position Sub-component; empty state shown when there are no items to display
 *
 * SYNC: When modified, update:
 * - /packages/core/templates/blocks/components/CommandPalette/ (showcase blocks)
 */

'use client';

import React, {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';

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

export interface CommandPaletteEmptyProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /** The message or content to display. */
  children: ReactNode;
}

/**
 * Empty state for the command palette list area.
 *
 * Rendered automatically by CommandPalette in two situations:
 * - `emptyBootstrapText`: no search term and bootstrap() returns nothing
 * - `emptySearchText`: a search query returned no results
 *
 * Can also be composed manually inside a custom render function.
 *
 * @example
 * ```
 * <CommandPalette
 *   emptyBootstrapText={<CommandPaletteEmpty>Start typing to search</CommandPaletteEmpty>}
 *   emptySearchText={<CommandPaletteEmpty>No results found</CommandPaletteEmpty>}
 *   searchSource={source}
 * />
 * ```
 */
export function CommandPaletteEmpty({
  ref,
  children,
  xstyle,
  className,
  style,
  ...props
}: CommandPaletteEmptyProps) {
  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('command-palette-empty'),
        stylex.props(styles.empty, xstyle),
        className,
        style,
      )}
      {...props}>
      {children}
    </div>
  );
}

CommandPaletteEmpty.displayName = 'CommandPaletteEmpty';
