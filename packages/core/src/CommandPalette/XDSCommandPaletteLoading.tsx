/**
 * @file XDSCommandPaletteLoading.tsx
 * @input Uses React, StyleX, XDSSpinner
 * @output Exports XDSCommandPaletteLoading component
 * @position Sub-component; loading indicator
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
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-4'],
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-sm'],
    color: colorVars['--color-text-secondary'],
  },
});

export interface XDSCommandPaletteLoadingProps {
  /** Loading content. */
  children?: ReactNode;
}

/**
 * Loading indicator for async command fetching.
 */
export function XDSCommandPaletteLoading({
  children = 'Loading...',
}: XDSCommandPaletteLoadingProps) {
  return (
    <div role="status" aria-live="polite" {...stylex.props(styles.loading)}>
      {children}
    </div>
  );
}

XDSCommandPaletteLoading.displayName = 'XDSCommandPaletteLoading';
