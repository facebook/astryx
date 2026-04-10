'use client';

/**
 * @file XDSProgressBar.tsx
 * @input Uses React, useId, stylex, color/spacing/radius/transition tokens
 * @output Exports XDSProgressBar component, XDSProgressBarProps, XDSProgressBarVariant types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/ProgressBar/ProgressBar.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/ProgressBar/XDSProgressBar.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/ProgressBar/index.ts (exports if types change)
 * - /apps/storybook/stories/ProgressBar.stories.tsx (storybook stories)
 */

import {useId} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  fontWeightVars,
  durationVars,
  easeVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';

/**
 * Extensible variant map for XDSProgressBar.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@xds/core/ProgressBar' {
 *   interface XDSProgressBarVariantMap {
 *     'brand': true;
 *   }
 * }
 * ```
 */
export interface XDSProgressBarVariantMap {
  accent: true;
  positive: true;
  warning: true;
  neutral: true;
  negative: true;
}

/**
 * Progress bar variant type — maps to semantic color tokens.
 * Extensible via module augmentation of XDSProgressBarVariantMap.
 */
export type XDSProgressBarVariant = keyof XDSProgressBarVariantMap;

export interface XDSProgressBarProps {
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
  variant?: XDSProgressBarVariant;
  /**
   * When true, renders an animated indeterminate progress indicator.
   * Use when the progress amount is unknown (e.g. loading, processing).
   * The `value` and `hasValueLabel` props are ignored in this mode.
   * Respects `prefers-reduced-motion` by slowing the animation.
   * @default false
   */
  isIndeterminate?: boolean;
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
  valueLabel: {
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    fontWeight: fontWeightVars['--font-weight-normal'],
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
  positive: {
    backgroundColor: colorVars['--color-success'],
  },
  warning: {
    backgroundColor: colorVars['--color-warning'],
  },
  negative: {
    backgroundColor: colorVars['--color-error'],
  },
  neutral: {
    backgroundColor: colorVars['--color-text-disabled'],
  },
});

function defaultFormatValueLabel(value: number, max: number): string {
  return `${Math.round((value / max) * 100)}%`;
}

/**
 * A progress bar for displaying determinate or indeterminate progress.
 *
 * In determinate mode, displays a known value within a range (upload progress,
 * disk usage, etc). In indeterminate mode, shows an animated loading indicator
 * for unknown progress.
 *
 * Styles use XDS theme tokens via StyleX.
 * Wrap your app in <Theme> to apply a theme.
 *
 * ProgressBar is intentionally minimal — compose additional labels, status
 * icons, and descriptions alongside the bar using layout components rather
 * than adding props to ProgressBar itself.
 *
 * @example
 * ```
 * <XDSProgressBar value={75} label="Upload progress" />
 * <XDSProgressBar isIndeterminate label="Loading..." />
 * <XDSProgressBar value={3.2} max={5} label="Disk usage" hasValueLabel
 *   formatValueLabel={(v, m) => `${v} GB / ${m} GB`} />
 * ```
 */
export function XDSProgressBar({
  value = 0,
  max = 100,
  label,
  isLabelHidden = false,
  hasValueLabel = false,
  formatValueLabel = defaultFormatValueLabel,
  variant = 'accent',
  isIndeterminate = false,
  xstyle,
  className,
  style,
  'data-testid': dataTestId,
  ref,
}: XDSProgressBarProps) {
  const labelId = useId();
  const clampedValue = Math.min(Math.max(0, value), max);
  const percentage = max > 0 ? (clampedValue / max) * 100 : 0;
  const valueText = formatValueLabel(clampedValue, max);

  // In indeterminate mode, don't show value label
  const showValueLabel = hasValueLabel && !isIndeterminate;

  return (
    <div
      ref={ref}
      {...mergeProps(
        xdsClassName('progressbar', {variant}),
        stylex.props(styles.container, xstyle),
        className,
        style,
      )}
      data-testid={dataTestId}>
      {/* Label row */}
      {!isLabelHidden || showValueLabel ? (
        <div {...stylex.props(styles.header)}>
          <span
            id={labelId}
            {...stylex.props(
              styles.label,
              isLabelHidden && styles.visuallyHidden,
            )}>
            {label}
          </span>
          {showValueLabel && (
            <span {...stylex.props(styles.valueLabel)}>{valueText}</span>
          )}
        </div>
      ) : (
        <span id={labelId} {...stylex.props(styles.visuallyHidden)}>
          {label}
        </span>
      )}

      {/* Progress track */}
      <div
        role={isIndeterminate ? 'progressbar' : 'meter'}
        aria-valuenow={isIndeterminate ? undefined : clampedValue}
        aria-valuemin={isIndeterminate ? undefined : 0}
        aria-valuemax={isIndeterminate ? undefined : max}
        aria-labelledby={labelId}
        aria-valuetext={isIndeterminate ? undefined : valueText}
        {...stylex.props(styles.track)}>
        {isIndeterminate ? (
          <div
            {...mergeProps(
              xdsClassName('progressbar-fill', {variant}),
              stylex.props(styles.indeterminateFill, variantStyles[variant]),
            )}
          />
        ) : (
          <div
            {...mergeProps(
              xdsClassName('progressbar-fill', {variant}),
              stylex.props(styles.fill, variantStyles[variant]),
            )}
            style={{width: `${percentage}%`}}
          />
        )}
      </div>
    </div>
  );
}

XDSProgressBar.displayName = 'XDSProgressBar';
