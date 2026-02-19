/**
 * @file types.ts
 * @input None
 * @output Exports shared types for XDSIllustration components
 * @position Type definitions; consumed by all illustration components
 */

import type {StyleXStyles} from '@stylexjs/stylex';

/**
 * Available illustration sizes.
 * - sm: 48px — compact empty states
 * - md: 80px — standard empty states
 * - lg: 120px — prominent empty states
 */
export type XDSIllustrationSize = 'sm' | 'md' | 'lg';

export interface XDSIllustrationProps {
  /**
   * Size of the illustration.
   * - sm: 48px — compact empty states
   * - md: 80px — standard empty states
   * - lg: 120px — prominent empty states
   * @default 'md'
   */
  size?: XDSIllustrationSize;

  /** StyleX overrides */
  xstyle?: StyleXStyles;

  /** Test ID */
  'data-testid'?: string;
}
