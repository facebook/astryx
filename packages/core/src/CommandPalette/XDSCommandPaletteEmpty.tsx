/**
 * @file XDSCommandPaletteEmpty.tsx
 * @input Uses React, StyleX
 * @output Exports XDSCommandPaletteEmpty component
 * @position Sub-component; shown when no results match
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
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: spacingVars['--spacing-6'],
    paddingInline: spacingVars['--spacing-4'],
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-sm'],
    color: colorVars['--color-text-secondary'],
    userSelect: 'none',
  },
});

export interface XDSCommandPaletteEmptyProps {
  /** Content to display when no results are found. */
  children: ReactNode;
}

/**
 * Empty state shown when no command palette items match the search.
 */
export function XDSCommandPaletteEmpty({children}: XDSCommandPaletteEmptyProps) {
  return (
    <div role="status" sx={styles.empty}>
      {children}
    </div>
  );
}

XDSCommandPaletteEmpty.displayName = 'XDSCommandPaletteEmpty';
