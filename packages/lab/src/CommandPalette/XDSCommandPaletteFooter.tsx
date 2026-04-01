/**
 * @file XDSCommandPaletteFooter.tsx
 * @input Uses React, StyleX, XDSKbd
 * @output Exports XDSCommandPaletteFooter component
 * @position Sub-component; footer with keyboard hints
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
import {XDSKbd} from '@xds/core/Kbd';

const styles = stylex.create({
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-4'],
    paddingBlock: spacingVars['--spacing-3'],
    flexShrink: 0,
    // Inherit font so custom children match hint text treatment
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
  },
  hint: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
});

export interface XDSCommandPaletteFooterProps extends XDSBaseProps<HTMLDivElement> {
  /** Ref forwarded to the footer element. */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Footer content. When provided, renders custom content instead of default hints.
   * Custom children inherit the footer font treatment (supporting/12px, secondary color).
   * When omitted, renders default keyboard navigation hints using XDSKbd.
   */
  children?: ReactNode;
}

/**
 * Footer for the command palette showing keyboard navigation hints.
 *
 * When no children are provided, renders default hints using XDSKbd
 * for arrow keys, Enter to select, and Escape to close.
 *
 * @compositionHint Pass to XDSCommandPalette's `footer` slot.
 *
 * @example
 * ```
 * <XDSCommandPalette
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   input={<XDSCommandPaletteInput />}
 *   footer={<XDSCommandPaletteFooter />}>
 *   <XDSCommandPaletteList>...</XDSCommandPaletteList>
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
          <span {...stylex.props(styles.hint)}>
            <XDSKbd keys="up" />
            <XDSKbd keys="down" />
            Navigate
          </span>
          <span {...stylex.props(styles.hint)}>
            <XDSKbd keys="enter" />
            Select
          </span>
          <span {...stylex.props(styles.hint)}>
            <XDSKbd keys="escape" />
            Close
          </span>
        </>
      )}
    </div>
  );
}

XDSCommandPaletteFooter.displayName = 'XDSCommandPaletteFooter';
