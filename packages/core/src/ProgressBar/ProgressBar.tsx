// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ProgressBar.tsx
 * @input Uses React, useId, stylex, color/spacing/radius/transition tokens
 * @output Exports ProgressBar component, ProgressBarProps, ProgressBarVariant types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/ProgressBar/ProgressBar.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/ProgressBar/ProgressBar.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/ProgressBar/index.ts (exports if types change)
 * - /apps/storybook/stories/ProgressBar.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/ProgressBar/ (showcase blocks)
 */

import {useId} from 'react';
import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  spacingVars,
  radiusVars,
  fontWeightVars,
  durationVars,
  easeVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {VisuallyHidden} from '../VisuallyHidden';

/**
 * Extensible variant map for ProgressBar.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@astryxdesign/core/ProgressBar' {
 *   interface ProgressBarVariantMap {
 *     'brand': true;
 *   }
 * }
 * ```
 */
export interface ProgressBarVariantMap {
  accent: true;
  success: true;
  warning: true;
  neutral: true;
  error: true;
}

/**
 * Progress bar variant type — maps to semantic color tokens.
 * Extensible via module augmentation of ProgressBarVariantMap.
 */
export type ProgressBarVariant = keyof ProgressBarVariantMap;

export interface ProgressBarProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Current value of the progress bar.
   * Ignored when `isIndeterminate` is true.
   */
  value?: number;
  /**
   * Maximum value of the progress bar.
   * @default 100
   */
  max?: number;
  /**
   * Accessible label for the progress bar. Required for a11y.
   * Shown visually above the bar unless `isLabelHidden` is true.
   */
  label: string;
  /**
   * When true, the label is visually hidden but remains accessible to screen readers.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * When true, displays the formatted value (e.g. "75%") next to the label.
   * Ignored when `isIndeterminate` is true.
   * @default false
   */
  hasValueLabel?: boolean;
  /**
   * Custom formatter for the value label.
   * @default (value, max) => `${Math.round((value / max) * 100)}%`
   */
  formatValueLabel?: (value: number, max: number) => string;
  /**
   * Visual style variant mapped to semantic color tokens.
   * @default 'accent'
   */
  variant?: ProgressBarVariant;
  /**
   * When true, renders an animated indeterminate progress indicator.
   * Use when the progress amount is unknown (e.g. loading, processing).
   * The `value` and `hasValueLabel` props are ignored in this mode.
   * Respects `prefers-reduced-motion` by slowing the animation.
   * @default false
   */
  isIndeterminate?: boolean;
  /**
   * When true, the progress bar is visually disabled — the fill bar and
   * text use disabled colors. Use for canceled or inactive operations.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Test ID for testing utilities.
   */
  'data-testid'?: string;
}

// =============================================================================
// Indeterminate animation
// =============================================================================

const indeterminateSlide = stylex.keyframes({
  '0%': {
    transform: 'translateX(-100%)',
  },
  '100%': {
    transform: 'translateX(250%)',
  },
});

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
    width: '100%',
    minWidth: '48px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-primary'],
  },
  labelDisabled: {
    color: colorVars['--color-text-disabled'],
  },
  valueLabel: {
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-secondary'],
  },
  valueLabelDisabled: {
    color: colorVars['--color-text-disabled'],
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
  track: {
    width: '100%',
    height: '8px',
    backgroundColor: colorVars['--color-background-muted'],
    borderRadius: radiusVars['--radius-full'],
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radiusVars['--radius-full'],
    transitionProperty: 'width',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  indeterminateFill: {
    height: '100%',
    width: '40%',
    borderRadius: radiusVars['--radius-full'],
    animationName: indeterminateSlide,
    animationDuration: {
      default: '1.5s',
      '@media (prefers-reduced-motion: reduce)': '3s',
    },
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  },
});

const variantStyles = stylex.create({
  accent: {
    backgroundColor: colorVars['--color-accent'],
  },
  success: {
    backgroundColor: colorVars['--color-success'],
  },
  warning: {
    backgroundColor: colorVars['--color-warning'],
  },
  error: {
    backgroundColor: colorVars['--color-error'],
  },
  neutral: {
    backgroundColor: colorVars['--color-text-disabled'],
  },
  disabled: {
    backgroundColor: colorVars['--color-text-disabled'],
  },
});

function defaultFormatValueLabel(value: number, max: number): string {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return `${pct}%`;
}

/**
 * A progress bar for displaying determinate or indeterminate progress.
 *
 * In determinate mode, displays a known value within a range (upload progress,
 * disk usage, etc). In indeterminate mode, shows an animated loading indicator
 * for unknown progress.
 *
 * ProgressBar is intentionally minimal — compose additional labels, status
 * icons, and descriptions alongside the bar using layout components rather
 * than adding props to ProgressBar itself.
 *
 * Styles use Astryx theme tokens via StyleX.
 * Wrap your app in <Theme> to apply a theme.
 *
 * @example
 * ```
 * <ProgressBar value={75} label="Upload progress" />
 * <ProgressBar isIndeterminate label="Loading..." />
 * <ProgressBar value={3.2} max={5} label="Disk usage" hasValueLabel
 *   formatValueLabel={(v, m) => `${v} GB / ${m} GB`} />
 * <ProgressBar value={30} label="Canceled" isDisabled hasValueLabel />
 * ```
 */
export function ProgressBar({
  value = 0,
  max = 100,
  label,
  isLabelHidden = false,
  hasValueLabel = false,
  formatValueLabel = defaultFormatValueLabel,
  variant = 'accent',
  isIndeterminate = false,
  isDisabled = false,
  xstyle,
  className,
  style,
  'data-testid': dataTestId,
  ref,
  ...rest
}: ProgressBarProps) {
  const labelId = useId();
  const clampedValue = Math.min(Math.max(0, value), max);
  const percentage = max > 0 ? (clampedValue / max) * 100 : 0;
  const valueText = formatValueLabel(clampedValue, max);

  const showValueLabel = hasValueLabel && !isIndeterminate;

  const fillVariant = isDisabled ? 'disabled' : variant;

  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('progressbar', {variant}),
        stylex.props(styles.container, xstyle),
        className,
        style,
      )}
      data-testid={dataTestId}
      {...rest}>
      {/* Label row */}
      {!isLabelHidden || showValueLabel ? (
        <div {...stylex.props(styles.header)}>
          <span
            id={labelId}
            {...stylex.props(
              styles.label,
              isLabelHidden && styles.visuallyHidden,
              isDisabled && styles.labelDisabled,
            )}>
            {label}
          </span>
          {showValueLabel && (
            <span
              {...stylex.props(
                styles.valueLabel,
                isDisabled && styles.valueLabelDisabled,
              )}>
              {valueText}
            </span>
          )}
        </div>
      ) : (
        <VisuallyHidden id={labelId}>{label}</VisuallyHidden>
      )}

      {/* Progress track */}
      <div
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : clampedValue}
        aria-valuemin={isIndeterminate ? undefined : 0}
        aria-valuemax={isIndeterminate ? undefined : max}
        aria-labelledby={labelId}
        aria-valuetext={isIndeterminate ? undefined : valueText}
        {...mergeProps(
          themeProps('progressbar-track'),
          stylex.props(styles.track),
        )}>
        {isIndeterminate ? (
          <div
            {...mergeProps(
              themeProps('progressbar-fill', {variant: fillVariant}),
              stylex.props(
                styles.indeterminateFill,
                variantStyles[fillVariant],
              ),
            )}
          />
        ) : (
          <div
            {...mergeProps(
              themeProps('progressbar-fill', {variant: fillVariant}),
              stylex.props(styles.fill, variantStyles[fillVariant]),
            )}
            style={{width: `${percentage}%`}}
          />
        )}
      </div>
    </div>
  );
}

ProgressBar.displayName = 'ProgressBar';
