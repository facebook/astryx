/**
 * @file XDSSpinner.tsx
 * @input Uses React, StyleX keyframes and tokens
 * @output Exports XDSSpinner component, XDSSpinnerProps, XDSSpinnerSize, XDSSpinnerShade types
 * @position Core implementation of spinner loading indicator
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Spinner/README.md
 * - /packages/core/src/Spinner/XDSSpinner.test.tsx
 * - /packages/core/src/Spinner/index.ts
 * - /apps/storybook/stories/Spinner.stories.tsx
 */

import {forwardRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';

// =============================================================================
// Animation Keyframes
// =============================================================================

const spinnerKeyframes = stylex.keyframes({
  to: {transform: 'rotate(360deg)'},
});

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  spinner: {
    display: 'inline-block',
    borderStyle: 'solid',
    borderColor: 'currentColor',
    borderRightColor: 'transparent',
    borderRadius: '50%',
    animationName: spinnerKeyframes,
    animationDuration: '0.6s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
});

const sizeStyles = stylex.create({
  sm: {width: 12, height: 12, borderWidth: 2},
  md: {width: 20, height: 20, borderWidth: 2},
  lg: {width: 28, height: 28, borderWidth: 3},
});

const shadeStyles = stylex.create({
  default: {color: colorVars['--color-text-secondary']},
  onMedia: {color: colorVars['--color-icon-on-media']},
});

// =============================================================================
// Types
// =============================================================================

export type XDSSpinnerSize = keyof typeof sizeStyles;
export type XDSSpinnerShade = keyof typeof shadeStyles;

// =============================================================================
// Component
// =============================================================================

export interface XDSSpinnerProps {
  /**
   * Spinner size.
   * - 'sm': 12px
   * - 'md': 20px
   * - 'lg': 28px
   * @default 'md'
   */
  size?: XDSSpinnerSize;
  /**
   * Color shade.
   * 'default' for light backgrounds, 'onMedia' for dark/accent backgrounds.
   * @default 'default'
   */
  shade?: XDSSpinnerShade;
  /**
   * Test ID for the root element.
   */
  'data-testid'?: string;
}

/**
 * A pure spinner component for indicating loading state.
 *
 * No layout or text — compose with XDSVStack + XDSText for loading states.
 *
 * @example
 * ```tsx
 * <XDSSpinner />
 * <XDSSpinner size="sm" />
 * <XDSSpinner size="lg" shade="onMedia" />
 * ```
 */
export const XDSSpinner = forwardRef<HTMLSpanElement, XDSSpinnerProps>(
  ({size = 'md', shade = 'default', 'data-testid': testId}, ref) => {
    return (
      <span
        ref={ref}
        role="status"
        aria-label="Loading"
        data-testid={testId}
        {...stylex.props(styles.spinner, sizeStyles[size], shadeStyles[shade])}
      />
    );
  },
);

XDSSpinner.displayName = 'XDSSpinner';
