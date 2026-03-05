/**
 * @file XDSCommandPaletteFooter.tsx
 * @input Uses React, StyleX
 * @output Exports XDSCommandPaletteFooter component
 * @position Sub-component; footer bar with hints
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  textSizeVars,
  typographyVars,
} from '../theme/tokens.stylex';

const styles = stylex.create({
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-4'],
    paddingBlock: spacingVars['--spacing-2'],
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: colorVars['--color-divider'],
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-xsm'],
    color: colorVars['--color-text-secondary'],
    userSelect: 'none',
  },
});

export interface XDSCommandPaletteFooterProps {
  /** Footer content — typically keyboard navigation hints. */
  children: ReactNode;
}

/**
 * Footer bar for the command palette.
 * Typically shows keyboard navigation hints.
 *
 * @example
 * ```
 * <XDSCommandPaletteFooter>
 *   <span>↑↓ Navigate</span>
 *   <span>↵ Select</span>
 *   <span>Esc Close</span>
 * </XDSCommandPaletteFooter>
 * ```
 */
export function XDSCommandPaletteFooter({children}: XDSCommandPaletteFooterProps) {
  return (
    <div {...stylex.props(styles.footer)}>
      {children}
    </div>
  );
}

XDSCommandPaletteFooter.displayName = 'XDSCommandPaletteFooter';
