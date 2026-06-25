// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Center.tsx
 * @input Uses React, StyleX for centering styles
 * @output Exports Center component and CenterProps
 * @position Center component for centering children horizontally/vertically
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Center/Center.doc.mjs
 * - /packages/core/src/Center/Center.test.tsx
 * - /apps/storybook/stories/Center.stories.tsx
 * - /packages/cli/templates/blocks/components/Center/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import type {SizeValue} from '../utils/types';
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
  sizing: (width: SizeValue | null, height: SizeValue | null) => ({
    width,
    height,
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
  isInline = false,
  children,
  xstyle,
  className,
  style,
  ref,
  ...props
}: CenterProps) {
  const stylexProps = mergeProps(
    themeProps('center', {axis}),
    stylex.props(
      isInline ? styles.inline : styles.base,
      (axis === 'both' || axis === 'vertical') && styles.alignItemsCenter,
      (axis === 'both' || axis === 'horizontal') && styles.justifyContentCenter,
      dynamicStyles.sizing(width ?? null, height ?? null),
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
