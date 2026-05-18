// Copyright (c) Meta Platforms, Inc. and affiliates.

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
 * - /packages/cli/templates/blocks/components/Spinner/ (showcase blocks)
 */

import {useEffect, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {durationVars, spacingVars} from '../theme/tokens.stylex';
import {useXDSTheme} from '../theme/useXDSTheme';
import {XDSBaseProps} from '../XDSBaseProps';
import {XDSText} from '../Text/XDSText';
import {xdsClassName, mergeProps} from '../utils';

// =============================================================================
// Constants
// =============================================================================

/** How much of the circle the active arc covers (as a fraction of 2π) */
const SPREAD = 0.75;
/** Where the active arc starts (as a fraction of 2π) */
const START_POINT = 1.5;

const SIZES = {
  sm: {diameter: 10, border: 2},
  md: {diameter: 14, border: 3},
  lg: {diameter: 18, border: 3},
  xl: {diameter: 28, border: 4},
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
  wrapper: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  spinner: {
    display: 'inline-block',
    overflow: 'hidden',
    verticalAlign: 'middle',
  },
  canvas: {
    backfaceVisibility: 'hidden',
    display: 'block',
    animationDuration: durationVars['--duration-slow-min'],
    animationIterationCount: 'infinite',
    animationName: rotation,
    animationTimingFunction: 'linear',
  },
});

// =============================================================================
// Types
// =============================================================================

export type XDSSpinnerSize = keyof typeof SIZES;

export type XDSSpinnerShade = 'default' | 'onMedia' | 'subtle';

export interface XDSSpinnerProps extends XDSBaseProps<HTMLSpanElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLSpanElement>;
  /**
   * Spinner size.
   * - 'sm': 10px diameter
   * - 'md': 14px diameter
   * - 'lg': 18px diameter
   * - 'xl': 36px diameter
   * @default 'md'
   */
  size?: XDSSpinnerSize;
  /**
   * Color shade.
   * - 'default': accent color on light backgrounds
   * - 'onMedia': white on dark/accent backgrounds
   * - 'subtle': secondary text color, less prominent — for inline use in lists
   * @default 'default'
   */
  shade?: XDSSpinnerShade;
  /**
   * Visible content displayed below the spinner.
   * Accepts a string or ReactNode for rich content.
   *
   * When `label` is a string, it is also used as the accessible name
   * (aria-label) unless `aria-label` is explicitly set.
   *
   * @example
   * ```
   * <XDSSpinner label="Loading..." />
   * <XDSSpinner label={<><strong>Fetching data</strong><br/>This may take a moment</>} aria-label="Fetching data" />
   * ```
   */
  label?: ReactNode;
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
 * <XDSSpinner label="Loading..." />
 * <XDSSpinner aria-label="Loading data" />
 * ```
 */
export function XDSSpinner({
  size = 'md',
  shade = 'default',
  label,
  xstyle,
  className,
  style,
  'aria-label': ariaLabel,
  'data-testid': testId,
  ref,
  ...restProps
}: XDSSpinnerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {tokens: themeTokens} = useXDSTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas == null) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const {border, diameter} = SIZES[size];
    const pixelRatio = window.devicePixelRatio || 1;

    // Resolve colors from theme tokens (useXDSTheme handles light/dark resolution).
    // - default → accent ring on a track tuned to body luminance
    // - subtle  → secondary text color, less prominent
    // - onMedia → on-dark color, with a translucent track for photos/video
    const activeColor =
      shade === 'onMedia'
        ? themeTokens['--color-on-dark']
        : shade === 'subtle'
          ? themeTokens['--color-text-secondary']
          : themeTokens['--color-accent'];
    // Track derives from --color-on-dark for onMedia (with a 30% alpha so the
    // ring reads against arbitrary backgrounds) and from --color-track for the
    // body-luminance shades. Both branches are fully theme-driven.
    const backgroundColor =
      shade === 'onMedia'
        ? `${themeTokens['--color-on-dark']}4D`
        : themeTokens['--color-track'];

    const radius = (diameter / 2) * pixelRatio;
    const lineWidth = border * pixelRatio;
    // Ensure even frame size so center is always on a whole pixel (prevents rotation jitter)
    const rawFrameSize = Math.ceil((radius + lineWidth) * 2);
    const frameSize = rawFrameSize + (rawFrameSize % 2);
    const cssSize = frameSize / pixelRatio;

    canvas.height = canvas.width = frameSize;
    canvas.style.width = canvas.style.height = cssSize + 'px';

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
  }, [shade, size, themeTokens]);

  const {border, diameter} = SIZES[size];
  const frameSize = diameter + border * 2;
  const hasLabel = label != null;

  // Resolve accessible name: explicit aria-label > string label > "Loading"
  const resolvedAriaLabel =
    ariaLabel ?? (typeof label === 'string' ? label : undefined) ?? 'Loading';

  const spinner = (
    <span
      ref={hasLabel ? undefined : ref}
      role="status"
      aria-label={resolvedAriaLabel}
      data-testid={hasLabel ? undefined : testId}
      {...(hasLabel ? {} : restProps)}
      {...mergeProps(
        hasLabel ? '' : xdsClassName('spinner', {size, shade}),
        stylex.props(styles.spinner, !hasLabel && xstyle),
        hasLabel ? undefined : className,
        {...(hasLabel ? {} : style), width: frameSize, height: frameSize},
      )}>
      <canvas ref={canvasRef} {...stylex.props(styles.canvas)} />
    </span>
  );

  if (!hasLabel) {
    return spinner;
  }

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      data-testid={testId}
      {...restProps}
      {...mergeProps(
        xdsClassName('spinner', {size, shade}),
        stylex.props(styles.wrapper, xstyle),
        className,
        style,
      )}>
      {spinner}
      {typeof label === 'string' ? (
        <XDSText type="body" weight="bold">
          {label}
        </XDSText>
      ) : (
        label
      )}
    </div>
  );
}

XDSSpinner.displayName = 'XDSSpinner';
