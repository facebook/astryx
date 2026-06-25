// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandPaletteGroup.tsx
 * @input Uses React, StyleX
 * @output Exports CommandPaletteGroup component
 * @position Sub-component; visual grouping with heading
 *
 * SYNC: When modified, update:
 * - /packages/cli/templates/blocks/components/CommandPalette/ (showcase blocks)
 */

'use client';

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from '../theme/tokens.stylex';

const styles = stylex.create({
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
    paddingBlock: spacingVars['--spacing-1'],
  },
  heading: {
    paddingInline: spacingVars['--spacing-3'],
    paddingBlock: spacingVars['--spacing-1'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
    userSelect: 'none',
  },
});

export interface CommandPaletteGroupProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element. */
  ref?: React.Ref<HTMLDivElement>;
  /** Group heading text. */
  heading: string;
  /** Items within this group. */
  children: ReactNode;
}

/**
 * Visual grouping for command palette items with a heading label.
 *
 * Heading style matches DropdownMenu section headings:
 * supporting-size (12px), secondary color, no uppercase/letterSpacing.
 *
 * @compositionHint Place inside CommandPaletteList.
 *   Contains CommandPaletteItem children.
 *
 * @example
 * ```
 * <CommandPaletteGroup heading="Navigation">
 *   <CommandPaletteItem value="home" onSelect={goHome}>
 *     Home
 *   </CommandPaletteItem>
 * </CommandPaletteGroup>
 * ```
 */
export function CommandPaletteGroup({
  heading,
  children,
  ref,
  xstyle,
  className,
  style,
  ...props
}: CommandPaletteGroupProps) {
  return (
    <div
      ref={ref}
      role="group"
      aria-label={heading}
      {...mergeProps(
        themeProps('command-palette-group'),
        stylex.props(styles.group, xstyle),
        className,
        style,
      )}
      {...props}>
      <div aria-hidden="true" {...stylex.props(styles.heading)}>
        {heading}
      </div>
      {children}
    </div>
  );
}

CommandPaletteGroup.displayName = 'CommandPaletteGroup';
