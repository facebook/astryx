/**
 * @file container.stylex.ts
 * @input Uses @stylexjs/stylex, spacing from theme
 * @output StyleX utility for layout container styling
 * @position Layout utility; used by XDSCard, XDSSection components
 *
 * SYNC: When modified, update /packages/core/src/Layout/README.md
 */

import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../../theme/tokens.stylex';

/**
 * Spacing token keys for padding props.
 */
export type SpacingToken =
  | 'spacing0'
  | 'spacing0_5'
  | 'spacing1'
  | 'spacing2'
  | 'spacing3'
  | 'spacing4'
  | 'spacing5'
  | 'spacing6'
  | 'spacing7';

const baseStyles = stylex.create({
  container: {
    boxSizing: 'border-box',
    padding: 'var(--container-padding)',
  },
});

/**
 * Container padding styles.
 * Sets --container-padding CSS variable for simple content padding.
 * XDSLayout will override this to 0 and handle its own padding.
 */
const containerPaddingStyles = stylex.create({
  spacing0: {'--container-padding': spacingVars['--spacing-0']},
  spacing0_5: {'--container-padding': spacingVars['--spacing-0-5']},
  spacing1: {'--container-padding': spacingVars['--spacing-1']},
  spacing2: {'--container-padding': spacingVars['--spacing-2']},
  spacing3: {'--container-padding': spacingVars['--spacing-3']},
  spacing4: {'--container-padding': spacingVars['--spacing-4']},
  spacing5: {'--container-padding': spacingVars['--spacing-5']},
  spacing6: {'--container-padding': spacingVars['--spacing-6']},
  spacing7: {'--container-padding': spacingVars['--spacing-7']},
});

const paddingOuterXStyles = stylex.create({
  spacing0: {'--layout-padding-outer-x': spacingVars['--spacing-0']},
  spacing0_5: {'--layout-padding-outer-x': spacingVars['--spacing-0-5']},
  spacing1: {'--layout-padding-outer-x': spacingVars['--spacing-1']},
  spacing2: {'--layout-padding-outer-x': spacingVars['--spacing-2']},
  spacing3: {'--layout-padding-outer-x': spacingVars['--spacing-3']},
  spacing4: {'--layout-padding-outer-x': spacingVars['--spacing-4']},
  spacing5: {'--layout-padding-outer-x': spacingVars['--spacing-5']},
  spacing6: {'--layout-padding-outer-x': spacingVars['--spacing-6']},
  spacing7: {'--layout-padding-outer-x': spacingVars['--spacing-7']},
});

const paddingOuterYStyles = stylex.create({
  spacing0: {'--layout-padding-outer-y': spacingVars['--spacing-0']},
  spacing0_5: {'--layout-padding-outer-y': spacingVars['--spacing-0-5']},
  spacing1: {'--layout-padding-outer-y': spacingVars['--spacing-1']},
  spacing2: {'--layout-padding-outer-y': spacingVars['--spacing-2']},
  spacing3: {'--layout-padding-outer-y': spacingVars['--spacing-3']},
  spacing4: {'--layout-padding-outer-y': spacingVars['--spacing-4']},
  spacing5: {'--layout-padding-outer-y': spacingVars['--spacing-5']},
  spacing6: {'--layout-padding-outer-y': spacingVars['--spacing-6']},
  spacing7: {'--layout-padding-outer-y': spacingVars['--spacing-7']},
});

const paddingInnerXStyles = stylex.create({
  spacing0: {'--layout-padding-inner-x': spacingVars['--spacing-0']},
  spacing0_5: {'--layout-padding-inner-x': spacingVars['--spacing-0-5']},
  spacing1: {'--layout-padding-inner-x': spacingVars['--spacing-1']},
  spacing2: {'--layout-padding-inner-x': spacingVars['--spacing-2']},
  spacing3: {'--layout-padding-inner-x': spacingVars['--spacing-3']},
  spacing4: {'--layout-padding-inner-x': spacingVars['--spacing-4']},
  spacing5: {'--layout-padding-inner-x': spacingVars['--spacing-5']},
  spacing6: {'--layout-padding-inner-x': spacingVars['--spacing-6']},
  spacing7: {'--layout-padding-inner-x': spacingVars['--spacing-7']},
});

const paddingInnerYStyles = stylex.create({
  spacing0: {'--layout-padding-inner-y': spacingVars['--spacing-0']},
  spacing0_5: {'--layout-padding-inner-y': spacingVars['--spacing-0-5']},
  spacing1: {'--layout-padding-inner-y': spacingVars['--spacing-1']},
  spacing2: {'--layout-padding-inner-y': spacingVars['--spacing-2']},
  spacing3: {'--layout-padding-inner-y': spacingVars['--spacing-3']},
  spacing4: {'--layout-padding-inner-y': spacingVars['--spacing-4']},
  spacing5: {'--layout-padding-inner-y': spacingVars['--spacing-5']},
  spacing6: {'--layout-padding-inner-y': spacingVars['--spacing-6']},
  spacing7: {'--layout-padding-inner-y': spacingVars['--spacing-7']},
});

export interface ContainerOptions {
  /**
   * Default container padding for simple content.
   * Sets --container-padding CSS variable.
   * XDSLayout overrides this to 0 and manages its own padding.
   * @default 'spacing4'
   */
  padding?: SpacingToken;

  /**
   * Outer horizontal padding (left/right).
   * Sets --layout-padding-outer-x CSS variable.
   * @default 'spacing4'
   */
  paddingOuterX?: SpacingToken;

  /**
   * Outer vertical padding (top/bottom).
   * Sets --layout-padding-outer-y CSS variable.
   * @default 'spacing4'
   */
  paddingOuterY?: SpacingToken;

  /**
   * Inner horizontal padding for content areas.
   * Sets --layout-padding-inner-x CSS variable.
   * @default 'spacing4'
   */
  paddingInnerX?: SpacingToken;

  /**
   * Inner vertical padding for content areas.
   * Sets --layout-padding-inner-y CSS variable.
   * @default 'spacing4'
   */
  paddingInnerY?: SpacingToken;
}

/**
 * StyleX utility to add layout container styles to any element.
 *
 * Sets CSS variables for padding that child layout components read:
 * - `--container-padding` — Default padding for simple content
 * - `--layout-padding-outer-x`, `--layout-padding-outer-y`
 * - `--layout-padding-inner-x`, `--layout-padding-inner-y`
 *
 * @example
 * ```tsx
 * import { container } from '@xds/core/Layout';
 * import * as stylex from '@stylexjs/stylex';
 *
 * // Basic container with default padding
 * <div {...stylex.props(...container({}))}>
 *   <XDSLayout ... />
 * </div>
 *
 * // Custom padding values
 * <div {...stylex.props(
 *   ...container({ padding: 'spacing3', paddingOuterY: 'spacing2', paddingInnerX: 'spacing3' }),
 *   customStyles.card
 * )}>
 *   <XDSLayout ... />
 * </div>
 * ```
 */
export function container({
  padding = 'spacing4',
  paddingOuterX = 'spacing4',
  paddingOuterY = 'spacing4',
  paddingInnerX = 'spacing4',
  paddingInnerY = 'spacing4',
}: ContainerOptions) {
  return [
    baseStyles.container,
    containerPaddingStyles[padding],
    paddingOuterXStyles[paddingOuterX],
    paddingOuterYStyles[paddingOuterY],
    paddingInnerXStyles[paddingInnerX],
    paddingInnerYStyles[paddingInnerY],
  ] as const;
}
