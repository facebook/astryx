/**
 * @file XDSCommandPaletteGroup.tsx
 * @input Uses React, StyleX
 * @output Exports XDSCommandPaletteGroup component
 * @position Sub-component; visual grouping with heading
 *
 * SYNC: When modified, update:
 * - /packages/lab/src/CommandPalette/README.md
 */

'use client';

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {XDSBaseProps} from '@xds/core/XDSBaseProps';
import {xdsClassName, mergeProps} from '@xds/core/utils';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
    paddingBlock: spacingVars['--spacing-1'],
  },
  heading: {
    paddingInlineStart: spacingVars['--spacing-3'],
    paddingInlineEnd: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-1'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
    userSelect: 'none',
  },
});

export interface XDSCommandPaletteGroupProps extends XDSBaseProps<HTMLDivElement> {
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
  ref,
  xstyle,
  className,
  style,
  ...props
}: XDSCommandPaletteGroupProps) {
  return (
    <div
      ref={ref}
      role="group"
      aria-label={heading}
      {...mergeProps(
        xdsClassName('command-palette-group'),
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

XDSCommandPaletteGroup.displayName = 'XDSCommandPaletteGroup';
