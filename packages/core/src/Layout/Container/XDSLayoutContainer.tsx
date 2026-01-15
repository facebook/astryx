/**
 * @file XDSLayoutContainer.tsx
 * @input Uses React forwardRef, ReactNode, StyleX
 * @output Exports XDSLayoutContainer component and XDSLayoutContainerProps
 * @position Layout/Container primitive component
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/Container/README.md
 * - /packages/core/src/Layout/Container/index.ts
 */

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import { spacingTokens } from '../../theme/tokens.stylex';

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

const styles = stylex.create({
  container: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
});

const paddingOuterXStyles = stylex.create({
  space0: { '--layout-padding-outer-x': spacingTokens.space0 },
  space0_5: { '--layout-padding-outer-x': spacingTokens.space0_5 },
  space1: { '--layout-padding-outer-x': spacingTokens.space1 },
  space2: { '--layout-padding-outer-x': spacingTokens.space2 },
  space3: { '--layout-padding-outer-x': spacingTokens.space3 },
  space4: { '--layout-padding-outer-x': spacingTokens.space4 },
  space5: { '--layout-padding-outer-x': spacingTokens.space5 },
  space6: { '--layout-padding-outer-x': spacingTokens.space6 },
  space7: { '--layout-padding-outer-x': spacingTokens.space7 },
});

const paddingOuterYStyles = stylex.create({
  space0: { '--layout-padding-outer-y': spacingTokens.space0 },
  space0_5: { '--layout-padding-outer-y': spacingTokens.space0_5 },
  space1: { '--layout-padding-outer-y': spacingTokens.space1 },
  space2: { '--layout-padding-outer-y': spacingTokens.space2 },
  space3: { '--layout-padding-outer-y': spacingTokens.space3 },
  space4: { '--layout-padding-outer-y': spacingTokens.space4 },
  space5: { '--layout-padding-outer-y': spacingTokens.space5 },
  space6: { '--layout-padding-outer-y': spacingTokens.space6 },
  space7: { '--layout-padding-outer-y': spacingTokens.space7 },
});

const paddingInnerXStyles = stylex.create({
  space0: { '--layout-padding-inner-x': spacingTokens.space0 },
  space0_5: { '--layout-padding-inner-x': spacingTokens.space0_5 },
  space1: { '--layout-padding-inner-x': spacingTokens.space1 },
  space2: { '--layout-padding-inner-x': spacingTokens.space2 },
  space3: { '--layout-padding-inner-x': spacingTokens.space3 },
  space4: { '--layout-padding-inner-x': spacingTokens.space4 },
  space5: { '--layout-padding-inner-x': spacingTokens.space5 },
  space6: { '--layout-padding-inner-x': spacingTokens.space6 },
  space7: { '--layout-padding-inner-x': spacingTokens.space7 },
});

const paddingInnerYStyles = stylex.create({
  space0: { '--layout-padding-inner-y': spacingTokens.space0 },
  space0_5: { '--layout-padding-inner-y': spacingTokens.space0_5 },
  space1: { '--layout-padding-inner-y': spacingTokens.space1 },
  space2: { '--layout-padding-inner-y': spacingTokens.space2 },
  space3: { '--layout-padding-inner-y': spacingTokens.space3 },
  space4: { '--layout-padding-inner-y': spacingTokens.space4 },
  space5: { '--layout-padding-inner-y': spacingTokens.space5 },
  space6: { '--layout-padding-inner-y': spacingTokens.space6 },
  space7: { '--layout-padding-inner-y': spacingTokens.space7 },
});

export interface XDSLayoutContainerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> {
  /**
   * Custom styles for the container.
   * Use for background, shadow, radius, sizing, etc.
   */
  xstyle?: StyleXStyles;

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

  /**
   * Content to render inside the container.
   * Should typically be XDSLayout child components.
   */
  children?: ReactNode;
}

/**
 * A primitive container component for layout composition.
 *
 * Sets CSS variables for padding that child layout components read:
 * - `--layout-padding-outer-x`, `--layout-padding-outer-y`
 * - `--layout-padding-inner-x`, `--layout-padding-inner-y`
 *
 * This is a low-level primitive. For styled containers, use:
 * - XDSCard - Card with elevation
 * - XDSSection - Section with background variants
 * - XDSModal, XDSPopover, etc.
 *
 * @example
 * ```tsx
 * // Direct usage (rare - prefer higher-order components)
 * <XDSLayoutContainer
 *   xstyle={customStyles}
 *   paddingInnerX="space3"
 *   paddingInnerY="space3"
 * >
 *   <XDSLayout ... />
 * </XDSLayoutContainer>
 * ```
 */
export const XDSLayoutContainer = forwardRef<HTMLDivElement, XDSLayoutContainerProps>(
  function XDSLayoutContainer(
    {
      xstyle,
      paddingOuterX = 'space4',
      paddingOuterY = 'space4',
      paddingInnerX = 'space4',
      paddingInnerY = 'space4',
      children,
      ...props
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        {...stylex.props(
          styles.container,
          paddingOuterXStyles[paddingOuterX],
          paddingOuterYStyles[paddingOuterY],
          paddingInnerXStyles[paddingInnerX],
          paddingInnerYStyles[paddingInnerY],
          xstyle
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

XDSLayoutContainer.displayName = 'XDSLayoutContainer';
