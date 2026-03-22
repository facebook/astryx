'use client';

/**
 * @file XDSCenter.tsx
 * @input Uses React, StyleX for centering styles
 * @output Exports XDSCenter component and XDSCenterProps
 * @position Center component for centering children horizontally/vertically
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Center/Center.doc.mjs
 * - /packages/core/src/Center/XDSCenter.test.tsx
 * - /apps/storybook/stories/Center.stories.tsx
 */


import {type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import type {SizeValue} from '../utils/types';
import {xdsClassName, mergeProps} from '../utils';

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

export interface XDSCenterProps extends XDSBaseProps<HTMLDivElement> {
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

  /**
   * StyleX styles created via `stylex.create()`. Merged with the component's
   * base styles inside a single `stylex.props()` call for optimal deduplication.
   *
   * @example
   * ```
   * const overrides = stylex.create({ root: { marginBottom: 8 } });
   * <Component xstyle={overrides.root} />
   * ```
   */
  xstyle?: StyleXStyles;
  /**
   * CSS class name(s) appended to the root element.
   * If you're using StyleX, prefer `xstyle` for optimal style deduplication.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element. Spread after StyleX
   * inline styles, so these values take priority.
   */
  style?: React.CSSProperties;
}

/**
 * Center component for centering children horizontally and/or vertically.
 *
 * Uses flexbox for centering. By default, centers on both axes.
 * Use the `axis` prop to center on only one axis.
 *
 * @example
 * ```
 * <XDSCenter width={300} height={200}>
 *   <Content />
 * </XDSCenter>
 * ```
 */
export function XDSCenter({
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
}: XDSCenterProps) {
  const stylexProps = mergeProps(
    xdsClassName('center', {axis}),
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

XDSCenter.displayName = 'XDSCenter';
