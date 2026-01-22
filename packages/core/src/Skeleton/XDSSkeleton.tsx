/**
 * @file XDSSkeleton.tsx
 * @input Uses React, StyleX keyframes and tokens
 * @output Exports XDSSkeleton component, XDSSkeletonProps, XDSSkeletonRadius types
 * @position Core implementation of skeleton loading placeholder
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Skeleton/README.md
 * - /packages/core/src/Skeleton/index.ts
 * - /apps/storybook/stories/Skeleton.stories.tsx
 */

import { forwardRef, type HTMLAttributes } from 'react';
import * as stylex from '@stylexjs/stylex';
import { color, radius } from '../theme/tokens.stylex';

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
  '0%': { opacity: 0.25 },
  '100%': { opacity: 1 },
});

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    backgroundColor: {
      default: color.glimmer,
      '@media (prefers-contrast: more)': color.glimmerHighContrast,
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
    borderRadius: radius.rounded,
  },
  container: {
    borderRadius: radius.container,
  },
  element: {
    borderRadius: radius.element,
  },
  content: {
    borderRadius: radius.content,
  },
  inner: {
    borderRadius: radius.inner,
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

export interface XDSSkeletonProps extends HTMLAttributes<HTMLDivElement> {
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

export const XDSSkeleton = forwardRef<HTMLDivElement, XDSSkeletonProps>(
  (
    {
      width = '100%',
      height = '100%',
      radius: radiusProp = 'container',
      index = 0,
      'data-testid': testId,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-testid={testId}
        {...stylex.props(
          styles.root,
          styles.animate,
          radiusStyles[radiusProp],
          dynamicStyles.dimensions(width, height),
          dynamicStyles.animationDelay(index)
        )}
        {...props}
      />
    );
  }
);

XDSSkeleton.displayName = 'XDSSkeleton';
