/**
 * @file XDSCommandPaletteSeparator.tsx
 * @input Uses XDSDivider
 * @output Exports XDSCommandPaletteSeparator component
 * @position Sub-component; visual divider between groups
 */

import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {XDSDivider} from '../Divider';

const styles = stylex.create({
  separator: {
    marginBlock: spacingVars['--spacing-1'],
  },
});

/**
 * Visual separator between command palette groups.
 * Uses XDSDivider internally for theming/swizzle compatibility.
 */
export function XDSCommandPaletteSeparator() {
  return <XDSDivider xstyle={styles.separator} />;
}

XDSCommandPaletteSeparator.displayName = 'XDSCommandPaletteSeparator';
