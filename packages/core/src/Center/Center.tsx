// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Center.tsx
 * @input Uses React, StyleX for centering styles, Layout padding.stylex for spacing-scale padding
 * @output Exports Center component and CenterProps
 * @position Center component for centering children horizontally/vertically
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Center/Center.doc.mjs
 * - /packages/core/src/Center/Center.test.tsx
 * - /apps/storybook/stories/Center.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Center/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import type {SizeValue, SpacingStep} from '../utils/types';
import {
  paddingInlineStyles,
  paddingBlockStartStyles,
  paddingBlockEndStyles,
} from '../Layout/padding.stylex';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

const styles = stylex.create({
  base: {
    display: 'flex',
  },
  inline: {
    display: 'inline-flex',
  },
  alignItemsCenter: {
    alignItems: 'center',
  },
  justifyContentCenter: {
    justifyContent: 'center',
  },
});

// Dynamic styles for sizing props
const dynamicStyles = stylex.create({
  sizing: (
    width: SizeValue | null,
    height: SizeValue | null,
    maxWidth: SizeValue | null,
    minHeight: SizeValue | null,
  ) => ({
    width,
    height,
    maxWidth,
    minHeight,
  }),
});

export type CenterAxis = 'both' | 'horizontal' | 'vertical';

export interface CenterProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Center axis - which direction(s) to center.
   * - `both`: Center both horizontally and vertically (default)
   * - `horizontal`: Center horizontally only (justifyContent: center)
   * - `vertical`: Center vertically only (alignItems: center)
   * @default 'both'
   */
  axis?: CenterAxis;

  /**
   * Width of the container.
   * Numbers are treated as pixels, strings are used as-is (e.g., '100%').
   */
  width?: SizeValue;

  /**
   * Height of the container.
   * Numbers are treated as pixels, strings are used as-is (e.g., '100%').
   */
  height?: SizeValue;

  /**
   * Maximum width of the container.
   * Numbers are treated as pixels, strings are used as-is (e.g., '100%').
   */
  maxWidth?: SizeValue;

  /**
   * Minimum height of the container.
   * Numbers are treated as pixels, strings are used as-is (e.g., '100%').
   */
  minHeight?: SizeValue;

  /**
   * Inner padding on all sides, using the spacing scale.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   *
   * Matches the `padding` prop on `Stack`, `Card`, `LayoutContent`, and `LayoutPanel`.
   */
  padding?: SpacingStep;

  /**
   * Inline (horizontal) padding, using the spacing scale.
   * Overrides `padding` on the inline axis when both are set.
   */
  paddingInline?: SpacingStep;

  /**
   * Block (vertical) padding, using the spacing scale.
   * Overrides `padding` on the block axis when both are set.
   */
  paddingBlock?: SpacingStep;

  /**
   * Block-start (top) padding, using the spacing scale.
   * Overrides `paddingBlock` and `padding` on that edge only.
   */
  paddingBlockStart?: SpacingStep;

  /**
   * Block-end (bottom) padding, using the spacing scale.
   * Overrides `paddingBlock` and `padding` on that edge only.
   */
  paddingBlockEnd?: SpacingStep;

  /**
   * Whether to make the container inline-flex (useful for text/icons).
   * @default false
   */
  isInline?: boolean;

  /**
   * Content to render inside the center container.
   */
  children: ReactNode;
}

/**
 * Center component for centering children horizontally and/or vertically.
 *
 * Uses flexbox for centering. By default, centers on both axes.
 * Use the `axis` prop to center on only one axis.
 *
 * @example
 * ```
 * <Center width={300} height={200}>
 *   <Content />
 * </Center>
 * ```
 */
export function Center({
  axis = 'both',
  width,
  height,
  maxWidth,
  minHeight,
  padding,
  paddingInline,
  paddingBlock,
  paddingBlockStart,
  paddingBlockEnd,
  isInline = false,
  children,
  xstyle,
  className,
  style,
  ref,
  ...props
}: CenterProps) {
  // Resolve padding to per-edge values: `padding` sets every edge;
  // `paddingInline` / `paddingBlock` take precedence on their own axis, and
  // `paddingBlockStart` / `paddingBlockEnd` take precedence on their own edge.
  const resolvedPaddingInline = paddingInline ?? padding;
  const resolvedPaddingBlockStart =
    paddingBlockStart ?? paddingBlock ?? padding;
  const resolvedPaddingBlockEnd = paddingBlockEnd ?? paddingBlock ?? padding;

  const stylexProps = mergeProps(
    themeProps('center', {axis}),
    stylex.props(
      isInline ? styles.inline : styles.base,
      (axis === 'both' || axis === 'vertical') && styles.alignItemsCenter,
      (axis === 'both' || axis === 'horizontal') && styles.justifyContentCenter,
      dynamicStyles.sizing(
        width ?? null,
        height ?? null,
        maxWidth ?? null,
        minHeight ?? null,
      ),
      resolvedPaddingInline != null &&
        paddingInlineStyles[resolvedPaddingInline],
      resolvedPaddingBlockStart != null &&
        paddingBlockStartStyles[resolvedPaddingBlockStart],
      resolvedPaddingBlockEnd != null &&
        paddingBlockEndStyles[resolvedPaddingBlockEnd],
      xstyle,
    ),
    className,
    style,
  );

  return (
    <div ref={ref} {...stylexProps} {...props}>
      {children}
    </div>
  );
}

Center.displayName = 'Center';
