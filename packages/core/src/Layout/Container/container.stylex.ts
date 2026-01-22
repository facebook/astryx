/**
 * @file container.stylex.ts
 * @input Uses @stylexjs/stylex, spacing from theme
 * @output StyleX utility for layout container styling
 * @position Layout utility; used by XDSCard, XDSSection components
 *
 * SYNC: When modified, update /packages/core/src/Layout/README.md
 */

import * as stylex from '@stylexjs/stylex';
import {spacing} from '../../theme/tokens.stylex';

/**
 * Spacing token keys for padding props.
 */
export type SpacingToken =
  | 'space0'
  | 'space0_5'
  | 'space1'
  | 'space2'
  | 'space3'
  | 'space4'
  | 'space5'
  | 'space6'
  | 'space7';

const baseStyles = stylex.create({
  container: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
});

const paddingOuterXStyles = stylex.create({
  space0: {'--layout-padding-outer-x': spacing.space0},
  space0_5: {'--layout-padding-outer-x': spacing.space0_5},
  space1: {'--layout-padding-outer-x': spacing.space1},
  space2: {'--layout-padding-outer-x': spacing.space2},
  space3: {'--layout-padding-outer-x': spacing.space3},
  space4: {'--layout-padding-outer-x': spacing.space4},
  space5: {'--layout-padding-outer-x': spacing.space5},
  space6: {'--layout-padding-outer-x': spacing.space6},
  space7: {'--layout-padding-outer-x': spacing.space7},
});

const paddingOuterYStyles = stylex.create({
  space0: {'--layout-padding-outer-y': spacing.space0},
  space0_5: {'--layout-padding-outer-y': spacing.space0_5},
  space1: {'--layout-padding-outer-y': spacing.space1},
  space2: {'--layout-padding-outer-y': spacing.space2},
  space3: {'--layout-padding-outer-y': spacing.space3},
  space4: {'--layout-padding-outer-y': spacing.space4},
  space5: {'--layout-padding-outer-y': spacing.space5},
  space6: {'--layout-padding-outer-y': spacing.space6},
  space7: {'--layout-padding-outer-y': spacing.space7},
});

const paddingInnerXStyles = stylex.create({
  space0: {'--layout-padding-inner-x': spacing.space0},
  space0_5: {'--layout-padding-inner-x': spacing.space0_5},
  space1: {'--layout-padding-inner-x': spacing.space1},
  space2: {'--layout-padding-inner-x': spacing.space2},
  space3: {'--layout-padding-inner-x': spacing.space3},
  space4: {'--layout-padding-inner-x': spacing.space4},
  space5: {'--layout-padding-inner-x': spacing.space5},
  space6: {'--layout-padding-inner-x': spacing.space6},
  space7: {'--layout-padding-inner-x': spacing.space7},
});

const paddingInnerYStyles = stylex.create({
  space0: {'--layout-padding-inner-y': spacing.space0},
  space0_5: {'--layout-padding-inner-y': spacing.space0_5},
  space1: {'--layout-padding-inner-y': spacing.space1},
  space2: {'--layout-padding-inner-y': spacing.space2},
  space3: {'--layout-padding-inner-y': spacing.space3},
  space4: {'--layout-padding-inner-y': spacing.space4},
  space5: {'--layout-padding-inner-y': spacing.space5},
  space6: {'--layout-padding-inner-y': spacing.space6},
  space7: {'--layout-padding-inner-y': spacing.space7},
});

export interface ContainerOptions {
  /**
   * Outer horizontal padding (left/right).
   * Sets --layout-padding-outer-x CSS variable.
   * @default 'space4'
   */
  paddingOuterX?: SpacingToken;

  /**
   * Outer vertical padding (top/bottom).
   * Sets --layout-padding-outer-y CSS variable.
   * @default 'space4'
   */
  paddingOuterY?: SpacingToken;

  /**
   * Inner horizontal padding for content areas.
   * Sets --layout-padding-inner-x CSS variable.
   * @default 'space4'
   */
  paddingInnerX?: SpacingToken;

  /**
   * Inner vertical padding for content areas.
   * Sets --layout-padding-inner-y CSS variable.
   * @default 'space4'
   */
  paddingInnerY?: SpacingToken;
}

/**
 * StyleX utility to add layout container styles to any element.
 *
 * Sets CSS variables for padding that child layout components read:
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
 *   ...container({ paddingInnerX: 'space3', paddingOuterY: 'space2' }),
 *   customStyles.card
 * )}>
 *   <XDSLayout ... />
 * </div>
 * ```
 */
export function container({
  paddingOuterX = 'space4',
  paddingOuterY = 'space4',
  paddingInnerX = 'space4',
  paddingInnerY = 'space4',
}: ContainerOptions) {
  return [
    baseStyles.container,
    paddingOuterXStyles[paddingOuterX],
    paddingOuterYStyles[paddingOuterY],
    paddingInnerXStyles[paddingInnerX],
    paddingInnerYStyles[paddingInnerY],
  ] as const;
}
