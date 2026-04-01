/**
 * @file XDSCommandPaletteFooter.tsx
 * @input Uses React, StyleX, XDSDivider
 * @output Exports XDSCommandPaletteFooter component
 * @position Sub-component; footer with keyboard hints
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
} from '@xds/core/theme/tokens.stylex';
import {XDSDivider} from '@xds/core/Divider';

const styles = stylex.create({
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-4'],
    paddingBlock: spacingVars['--spacing-2'],
    flexShrink: 0,
  },
  hint: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: textSizeVars['--font-size-xs'],
    color: colorVars['--color-text-secondary'],
  },
});

export interface XDSCommandPaletteFooterProps extends XDSBaseProps<HTMLDivElement> {
  /**
   * Ref forwarded to the footer element.
   */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Footer content. When provided, renders custom content instead of default hints.
   * When omitted, renders default keyboard navigation hints.
   */
  children?: ReactNode;
}

/**
 * Footer for the command palette showing keyboard navigation hints.
 *
 * When no children are provided, renders default hints for
 * arrow keys, Enter to select, and Escape to close.
 *
 * @compositionHint Place as the last child of XDSCommandPalette.
 *
 * @example
 * ```
 * <XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
 *   <XDSCommandPaletteInput />
 *   <XDSCommandPaletteList>...</XDSCommandPaletteList>
 *   <XDSCommandPaletteFooter />
 * </XDSCommandPalette>
 * ```
 */
export function XDSCommandPaletteFooter({
  children,
  ref,
  xstyle,
  className,
  style,
  ...props
}: XDSCommandPaletteFooterProps) {
  return (
    <>
      <XDSDivider />
      <div
        ref={ref}
        {...mergeProps(
          xdsClassName('command-palette-footer'),
          stylex.props(styles.footer, xstyle),
          className,
          style,
        )}
        {...props}>
        {children ?? (
          <>
            <span {...stylex.props(styles.hint)}>\u2191\u2193 Navigate</span>
            <span {...stylex.props(styles.hint)}>\u21b5 Select</span>
            <span {...stylex.props(styles.hint)}>Esc Close</span>
          </>
        )}
      </div>
    </>
  );
}

XDSCommandPaletteFooter.displayName = 'XDSCommandPaletteFooter';
