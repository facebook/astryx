// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file CircularProgress.tsx
 * @input Uses React, useId, stylex, SVG, color/spacing/duration/ease tokens
 * @output Exports CircularProgress component, CircularProgressProps, CircularProgressSize, CircularProgressVariant types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CircularProgress/CircularProgress.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/CircularProgress/CircularProgress.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/CircularProgress/index.ts (exports if types change)
 * - /apps/storybook/stories/CircularProgress.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/CircularProgress/ (showcase blocks)
 */

import {useId, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  durationVars,
  easeVars,
  fontWeightVars,
  spacingVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {mergeProps} from '@astryxdesign/core/utils';
import type {BaseProps} from '@astryxdesign/core';
import {themeProps} from '../../../core/src/utils/themeProps';

/**
 * Extensible variant map for CircularProgress.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@astryxdesign/core/CircularProgress' {
 *   interface CircularProgressVariantMap {
 *     'brand': true;
 *   }
 * }
 * ```
 */
export interface CircularProgressVariantMap {
  accent: true;
  success: true;
  warning: true;
  error: true;
  neutral: true;
}

export type CircularProgressVariant = keyof CircularProgressVariantMap;

export type CircularProgressSize = 'sm' | 'md' | 'lg';

const SIZE_CONFIG = {
  sm: {diameter: 32, strokeWidth: 3},
  md: {diameter: 48, strokeWidth: 4},
  lg: {diameter: 64, strokeWidth: 5},
} as const;

export interface CircularProgressProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Current value of the circular progress.
   * When omitted, the component renders an indeterminate spinning animation.
   */
  value?: number;
  /**
   * Maximum value.
   * @default 100
   */
  max?: number;
  /**
   * Accessible label for the progress indicator. Required for a11y.
   */
  label: string;
  /**
   * When true, the label is visually hidden but remains accessible to screen readers.
   * @default true
   */
  isLabelHidden?: boolean;
  /**
   * Content displayed in the center of the ring.
   * Typically a percentage string, icon, or custom content.
   */
  children?: ReactNode;
  /**
   * Diameter of the circular progress.
   * - 'sm': 32px
   * - 'md': 48px
   * - 'lg': 64px
   * @default 'md'
   */
  size?: CircularProgressSize;
  /**
   * Visual style variant mapped to semantic color tokens.
   * @default 'accent'
   */
  variant?: CircularProgressVariant;
  /**
   * Test ID for testing utilities.
   */
  'data-testid'?: string;
}

// =============================================================================
// Indeterminate animation
// =============================================================================

const indeterminateRotation = stylex.keyframes({
  '0%': {transform: 'rotate(0deg)'},
  '100%': {transform: 'rotate(360deg)'},
});

const indeterminateDash = stylex.keyframes({
  '0%': {
    strokeDasharray: '1, 150',
    strokeDashoffset: '0',
  },
  '50%': {
    strokeDasharray: '90, 150',
    strokeDashoffset: '-35',
  },
  '100%': {
    strokeDasharray: '90, 150',
    strokeDashoffset: '-124',
  },
});

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  rootWithLabel: {
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
  },
  svg: {
    display: 'block',
    transform: 'rotate(-90deg)',
  },
  svgIndeterminate: {
    display: 'block',
    animationName: indeterminateRotation,
    animationDuration: {
      default: '2s',
      '@media (prefers-reduced-motion: reduce)': '4s',
    },
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
  track: {
    fill: 'none',
    stroke: colorVars['--color-track'],
  },
  fill: {
    fill: 'none',
    strokeLinecap: 'round',
    transitionProperty: 'stroke-dashoffset',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  fillIndeterminate: {
    fill: 'none',
    strokeLinecap: 'round',
    animationName: indeterminateDash,
    animationDuration: {
      default: '1.5s',
      '@media (prefers-reduced-motion: reduce)': '3s',
    },
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  },
  children: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  label: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-secondary'],
  },
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
  ringWrapper: {
    position: 'relative',
    display: 'inline-flex',
  },
});

const variantStyles = stylex.create({
  accent: {
    stroke: colorVars['--color-accent'],
  },
  success: {
    stroke: colorVars['--color-success'],
  },
  warning: {
    stroke: colorVars['--color-warning'],
  },
  error: {
    stroke: colorVars['--color-error'],
  },
  neutral: {
    stroke: colorVars['--color-text-disabled'],
  },
});

const trackVariantStyles = stylex.create({
  accent: {
    stroke: colorVars['--color-accent-muted'],
  },
  success: {
    stroke: colorVars['--color-success-muted'],
  },
  warning: {
    stroke: colorVars['--color-warning-muted'],
  },
  error: {
    stroke: colorVars['--color-error-muted'],
  },
  neutral: {
    stroke: colorVars['--color-track'],
  },
});

/**
 * A circular/radial progress indicator that shows completion as a ring.
 *
 * In determinate mode, displays a known value as an arc fill.
 * In indeterminate mode, shows an animated spinning indicator.
 * Supports center content via children for labels, percentages, or icons.
 *
 * @example
 * ```
 * <CircularProgress value={75} label="Upload progress" />
 * <CircularProgress value={75} label="Progress" max={100}>75%</CircularProgress>
 * <CircularProgress label="Loading..." />
 * ```
 */
export function CircularProgress({
  value,
  max = 100,
  label,
  isLabelHidden = true,
  children,
  size = 'md',
  variant = 'accent',
  xstyle,
  className,
  style,
  'data-testid': dataTestId,
  ref,
  ...rest
}: CircularProgressProps) {
  const labelId = useId();
  const isIndeterminate = value == null;
  const {diameter, strokeWidth} = SIZE_CONFIG[size];
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const resolvedValue = value ?? 0;
  const clampedValue = Math.min(Math.max(0, resolvedValue), max);
  const percentage = max > 0 ? clampedValue / max : 0;
  const dashoffset = circumference * (1 - percentage);

  const center = diameter / 2;

  const showLabel = !isLabelHidden;

  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('circular-progress', {variant, size}),
        stylex.props(styles.root, showLabel && styles.rootWithLabel, xstyle),
        className,
        style,
      )}
      data-testid={dataTestId}
      {...rest}>
      <span
        id={labelId}
        {...stylex.props(showLabel ? styles.label : styles.visuallyHidden)}>
        {label}
      </span>

      <div {...stylex.props(styles.ringWrapper)}>
        <svg
          role={isIndeterminate ? 'progressbar' : 'meter'}
          aria-labelledby={labelId}
          aria-valuenow={isIndeterminate ? undefined : clampedValue}
          aria-valuemin={isIndeterminate ? undefined : 0}
          aria-valuemax={isIndeterminate ? undefined : max}
          width={diameter}
          height={diameter}
          viewBox={`0 0 ${diameter} ${diameter}`}
          {...stylex.props(
            isIndeterminate ? styles.svgIndeterminate : styles.svg,
          )}>
          <circle
            {...mergeProps(
              themeProps('circular-progress-track'),
              stylex.props(styles.track, trackVariantStyles[variant]),
            )}
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
          />
          {isIndeterminate ? (
            <circle
              {...mergeProps(
                themeProps('circular-progress-fill', {variant}),
                stylex.props(styles.fillIndeterminate, variantStyles[variant]),
              )}
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
            />
          ) : (
            <circle
              {...mergeProps(
                themeProps('circular-progress-fill', {variant}),
                stylex.props(styles.fill, variantStyles[variant]),
              )}
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
            />
          )}
        </svg>

        {children != null && (
          <div {...stylex.props(styles.children)}>{children}</div>
        )}
      </div>
    </div>
  );
}

CircularProgress.displayName = 'CircularProgress';
