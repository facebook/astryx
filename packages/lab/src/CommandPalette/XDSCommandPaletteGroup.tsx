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
import type {XDSBaseProps} from '@xds/core/XDSBaseProps';
import {xdsClassName, mergeProps} from '@xds/core/utils';
import {
  colorVars,
  spacingVars,
  textSizeVars,
  typographyVars,
  fontWeightVars,
} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  group: {
    paddingBlock: spacingVars['--spacing-1'],
  },
  heading: {
    paddingInline: spacingVars['--spacing-3'],
    paddingBlock: spacingVars['--spacing-1'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: textSizeVars['--font-size-xs'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-secondary'],
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    userSelect: 'none',
  },
});

export interface XDSCommandPaletteGroupProps extends XDSBaseProps<HTMLDivElement> {
  /**
   * Ref forwarded to the root element.
   */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Group heading text.
   */
  heading: string;

  /**
   * Items within this group.
   */
  children: ReactNode;
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
