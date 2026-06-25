// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Skeleton.tsx
 * @input Uses React, StyleX keyframes and tokens
 * @output Exports Skeleton component, SkeletonProps, SkeletonRadius types
 * @position Core implementation of skeleton loading placeholder
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Skeleton/Skeleton.doc.mjs
 * - /packages/core/src/Skeleton/index.ts
 * - /apps/storybook/stories/Skeleton.stories.tsx
 * - /packages/cli/templates/blocks/components/Skeleton/ (showcase blocks)
 */

import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {colorVars, radiusVars, durationVars} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Animation Timing Constants
// =============================================================================

/**
 * Initial delay before animation starts (ms).
 * Prevents flash of animation for fast-loading content.
 */
const DELAY_TIME = 1000;

/**
 * Stagger increment between sequential skeleton elements (ms).
 * Creates a wave effect when multiple skeletons are used together.
 */
const STAGGER_TIME = 100;

// =============================================================================
// Animation Keyframes
// =============================================================================

const skeletonFade = stylex.keyframes({
  '0%': {opacity: 0.25},
  '100%': {opacity: 1},
});

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    backgroundColor: {
      default: colorVars['--color-skeleton'],
      '@media (prefers-contrast: more)': `color-mix(in srgb, ${colorVars['--color-skeleton']}, ${colorVars['--color-text-primary']} 30%)`,
    },
    opacity: 0.25,
  },
  animate: {
    animationDirection: 'alternate',
    animationDuration: durationVars['--duration-medium-max'],
    animationIterationCount: 'infinite',
    animationName: skeletonFade,
    animationTimingFunction: 'steps(10, end)',
  },
});

const radiusStyles = stylex.create({
  // Numeric scale names (preferred)
  none: {
    borderRadius: 0,
  },
  0: {
    borderRadius: radiusVars['--radius-none'],
  },
  1: {
    borderRadius: radiusVars['--radius-inner'],
  },
  2: {
    borderRadius: radiusVars['--radius-element'],
  },
  3: {
    borderRadius: radiusVars['--radius-container'],
  },
  4: {
    borderRadius: radiusVars['--radius-container'],
  },
  rounded: {
    borderRadius: radiusVars['--radius-full'],
  },
});

const dynamicStyles = stylex.create({
  animationDelay: (index: number) => ({
    animationDelay: `${DELAY_TIME + STAGGER_TIME * index}ms`,
  }),
  dimensions: (width: number | string, height: number | string) => ({
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }),
});

// =============================================================================
// Types
// =============================================================================

export type SkeletonRadius = keyof typeof radiusStyles;

// =============================================================================
// Component
// =============================================================================

export interface SkeletonProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Width of the skeleton.
   * Accepts a number (pixels) or string (any CSS value).
   * @default '100%'
   */
  width?: number | string;
  /**
   * Height of the skeleton.
   * Accepts a number (pixels) or string (any CSS value).
   * @default '100%'
   */
  height?: number | string;
  /**
   * Border radius of the skeleton, using design token scale.
   * - 'none': No border radius (sharp corners)
   * - 0: radius-0 token (0px)
   * - 1: radius-1 token (4px)
   * - 2: radius-2 token (8px)
   * - 3: radius-3 token (12px, default)
   * - 4: radius-4 token (16px)
   * - 'rounded': Fully rounded (for avatars, pills)
   * @default 3
   */
  radius?: SkeletonRadius;
  /**
   * Index for staggered animation timing.
   * Use sequential indices (0, 1, 2, ...) for multiple skeletons
   * to create a wave effect.
   * @default 0
   */
  index?: number;
  /**
   * Test ID for testing purposes.
   */
  'data-testid'?: string;
}

/**
 * A placeholder shape that indicates content is loading.
 * Renders a pulsing block with configurable width, height, and border radius.
 * Use the `index` prop to stagger animation timing across multiple skeletons.
 *
 * @example
 * ```
 * <Skeleton width={200} height={20} />
 * <Skeleton width={40} height={40} radius="rounded" />
 * <Skeleton width={300} height={16} index={0} />
 * <Skeleton width={280} height={16} index={1} />
 * ```
 */
export function Skeleton({
  width = '100%',
  height = '100%',
  radius: radiusProp = 3,
  index = 0,
  'data-testid': testId,
  xstyle,
  className,
  style,
  ref,
  ...props
}: SkeletonProps) {
  return (
    <div
      ref={ref}
      data-testid={testId}
      {...mergeProps(
        themeProps('skeleton'),
        stylex.props(
          styles.root,
          styles.animate,
          radiusStyles[radiusProp],
          dynamicStyles.dimensions(width, height),
          dynamicStyles.animationDelay(index),
          xstyle,
        ),
        className,
        style,
      )}
      {...props}
    />
  );
}

Skeleton.displayName = 'Skeleton';
