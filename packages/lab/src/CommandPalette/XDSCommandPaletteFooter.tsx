/**
 * @file XDSCommandPaletteFooter.tsx
 * @input Uses React, StyleX
 * @output Exports XDSCommandPaletteFooter component
 * @position Sub-component; footer with keyboard hints and built-in top separator
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
  borderVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-4'],
    paddingBlock: spacingVars['--spacing-2'],
    flexShrink: 0,
    // Built-in separator — no manual <XDSDivider /> needed
    borderBlockStartWidth: borderVars['--border-width'],
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: colorVars['--color-border'],
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
   * Custom children inherit the footer's font treatment (supporting/12px, secondary color).
   * When omitted, renders default keyboard navigation hints.
   */
  children?: ReactNode;
}

/**
 * Footer for the command palette showing keyboard navigation hints.
 *
 * Renders with a built-in top separator — no XDSDivider needed.
 * Custom children inherit supporting text treatment (12px, secondary color)
 * so they stay visually consistent with the default hints.
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
  );
}

XDSCommandPaletteFooter.displayName = 'XDSCommandPaletteFooter';
