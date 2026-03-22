'use client';

/**
 * @file XDSSpinner.tsx
 * @input Uses React, StyleX, canvas rendering
 * @output Exports XDSSpinner component, XDSSpinnerProps, XDSSpinnerSize, XDSSpinnerShade types
 * @position Core implementation of spinner loading indicator
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Spinner/Spinner.doc.mjs
 * - /packages/core/src/Spinner/XDSSpinner.test.tsx
 * - /packages/core/src/Spinner/index.ts
 * - /apps/storybook/stories/Spinner.stories.tsx
 */


import {useEffect, useRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';

// =============================================================================
// Constants
// =============================================================================

/** How much of the circle the active arc covers (as a fraction of 2π) */
const SPREAD = 0.75;
/** Where the active arc starts (as a fraction of 2π) */
const START_POINT = 1.5;

const SIZES = {
  sm: {diameter: 10, border: 3},
  md: {diameter: 14, border: 3},
  lg: {diameter: 18, border: 3},
};

// =============================================================================
// Animation
// =============================================================================

const rotation = stylex.keyframes({
  '0%': {transform: 'rotate(0deg)'},
  '100%': {transform: 'rotate(360deg)'},
});

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  spinner: {
    display: 'inline-block',
    overflow: 'hidden',
    verticalAlign: 'middle',
  },
  canvas: {
    backfaceVisibility: 'hidden',
    display: 'block',
    animationDuration: '750ms',
    animationIterationCount: 'infinite',
    animationName: rotation,
    animationTimingFunction: 'linear',
  },
});

// =============================================================================
// Types
// =============================================================================

export type XDSSpinnerSize = keyof typeof SIZES;

export type XDSSpinnerShade = 'default' | 'onMedia';

export interface XDSSpinnerProps {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLSpanElement>;
  /**
   * Spinner size.
   * - 'sm': 10px diameter
   * - 'md': 14px diameter
   * - 'lg': 18px diameter
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

// =============================================================================
// Component
// =============================================================================

/**
 * An animated loading indicator. Available in three sizes and two color shades.
 *
 * @example
 * ```
 * <XDSSpinner />
 * <XDSSpinner size="sm" />
 * <XDSSpinner size="lg" shade="onMedia" />
 * ```
 */
export function XDSSpinner({
  size = 'md',
  shade = 'default',
  'data-testid': testId,
  ref,
}: XDSSpinnerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas == null) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const {border, diameter} = SIZES[size];
    const pixelRatio = window.devicePixelRatio || 1;

    // Resolve colors from CSS custom properties
    const computedStyle = getComputedStyle(canvas);
    const activeColor =
      shade === 'onMedia'
        ? computedStyle.getPropertyValue(
            colorVars['--color-icon-on-dark-media'],
          ) || '#FFFFFF'
        : computedStyle.getPropertyValue(colorVars['--color-accent']) ||
          '#0064E0';
    const backgroundColor =
      shade === 'onMedia' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)';

    const radius = (diameter / 2) * pixelRatio;
    const lineWidth = border * pixelRatio;
    const frameSize = (radius + lineWidth) * 2;

    canvas.height = canvas.width = frameSize;
    canvas.style.width = canvas.style.height = frameSize / pixelRatio + 'px';

    context.lineCap = 'round';
    context.lineWidth = lineWidth;

    const center = frameSize / 2;

    // Background circle (full ring, faded)
    context.beginPath();
    context.arc(center, center, radius, 0, 2 * Math.PI);
    context.strokeStyle = backgroundColor;
    context.stroke();

    // Active arc (partial ring, colored)
    context.beginPath();
    context.arc(
      center,
      center,
      radius,
      START_POINT * Math.PI,
      ((START_POINT + SPREAD) % 2) * Math.PI,
    );
    context.strokeStyle = activeColor;
    context.stroke();
  }, [shade, size]);

  const {border, diameter} = SIZES[size];
  const frameSize = diameter + border * 2;

  return (
    <span
      ref={ref}
      role="status"
      aria-label="Loading"
      data-testid={testId}
      {...mergeProps(
        xdsClassName('spinner', {size}),
        stylex.props(styles.spinner),
      )}
      style={{width: frameSize, height: frameSize}}>
      <canvas ref={canvasRef} {...stylex.props(styles.canvas)} />
    </span>
  );
}

XDSSpinner.displayName = 'XDSSpinner';
