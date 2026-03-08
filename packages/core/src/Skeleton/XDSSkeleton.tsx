/**
 * @file XDSSkeleton.tsx
 * @input Uses React, StyleX keyframes and tokens
 * @output Exports XDSSkeleton component, XDSSkeletonProps, XDSSkeletonRadius types
 * @position Core implementation of skeleton loading placeholder
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Skeleton/Skeleton.doc.mjs
 * - /packages/core/src/Skeleton/index.ts
 * - /apps/storybook/stories/Skeleton.stories.tsx
 */

'use client';

import {forwardRef} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {colorVars, radiusVars} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';

// =============================================================================
// Animation Timing Constants
// =============================================================================

/**
 * Initial delay before animation starts (ms).
 * Prevents flash of animation for fast-loading content.
 */
const DELAY_TIME = 1000;

/**
 * Duration of one fade cycle (ms).
 * Controls how quickly the skeleton pulses between opacity values.
 */
const FADE_TIME = 1000;

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
      default: colorVars['--color-glimmer'],
      '@media (prefers-contrast: more)':
        colorVars['--color-glimmer-high-contrast'],
    },
    opacity: 0.25,
  },
  animate: {
    animationDirection: 'alternate',
    animationDuration: `${FADE_TIME}ms`,
    animationIterationCount: 'infinite',
    animationName: skeletonFade,
    animationTimingFunction: 'steps(10, end)',
  },
});

const radiusStyles = stylex.create({
  none: {
    borderRadius: 0,
  },
  rounded: {
    borderRadius: radiusVars['--radius-rounded'],
  },
  container: {
    borderRadius: radiusVars['--radius-container'],
  },
  element: {
    borderRadius: radiusVars['--radius-element'],
  },
  content: {
    borderRadius: radiusVars['--radius-content'],
  },
  inner: {
    borderRadius: radiusVars['--radius-inner'],
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

export type XDSSkeletonRadius = keyof typeof radiusStyles;

// =============================================================================
// Component
// =============================================================================

export interface XDSSkeletonProps extends XDSBaseProps<HTMLDivElement> {
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
   * Border radius of the skeleton, using design token names.
   * - 'none': No border radius (sharp corners)
   * - 'inner': Inner radius
   * - 'content': Content radius
   * - 'element': Element radius
   * - 'container': Container radius (default)
   * - 'rounded': Fully rounded (for avatars, pills)
   * @default 'container'
   */
  radius?: XDSSkeletonRadius;
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
 * <XDSSkeleton width={200} height={20} />
 * <XDSSkeleton width={40} height={40} radius="rounded" />
 * <XDSSkeleton width={300} height={16} index={0} />
 * <XDSSkeleton width={280} height={16} index={1} />
 * ```
 */
export const XDSSkeleton = forwardRef<HTMLDivElement, XDSSkeletonProps>(
  (
    {
      width = '100%',
      height = '100%',
      radius: radiusProp = 'container',
      index = 0,
      'data-testid': testId,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        data-testid={testId}
        {...mergeProps(
          xdsClassName('skeleton'),
          stylex.props(
            styles.root,
            styles.animate,
            radiusStyles[radiusProp],
            dynamicStyles.dimensions(width, height),
            dynamicStyles.animationDelay(index),
          ),
          className,
          style,
        )}
        {...props}
      />
    );
  },
);

XDSSkeleton.displayName = 'XDSSkeleton';
