// Copyright (c) Meta Platforms, Inc. and affiliates.

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
 * - /packages/cli/templates/blocks/components/ProgressBar/ (showcase blocks)
 */

import {useId, type ReactNode} from 'react';
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
import {xdsClassName, mergeProps} from '../utils';
import {XDSIcon} from '../Icon';
import type {XDSIconName, XDSIconColor} from '../Icon';
import type {XDSBaseProps} from '../XDSBaseProps';

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
  success: true;
  warning: true;
  neutral: true;
  error: true;
}

/**
 * Progress bar variant type — maps to semantic color tokens.
 * Extensible via module augmentation of XDSProgressBarVariantMap.
 */
export type XDSProgressBarVariant = keyof XDSProgressBarVariantMap;

/**
 * Semantic state of the progress operation.
 */
export type XDSProgressBarStatus = 'active' | 'paused' | 'canceled';

export interface XDSProgressBarProps extends XDSBaseProps<HTMLDivElement> {
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
   * Semantic state of the progress operation.
   * - `'active'` (default): normal progress
   * - `'paused'`: operation is paused, shows pause icon
   * - `'canceled'`: operation was canceled, grays out bar, shows X icon
   * @default 'active'
   */
  status?: XDSProgressBarStatus;
  /**
   * Secondary description shown below the bar.
   * Use for additional context like "40 MB / 100 MB downloaded".
   */
  description?: string;
  /**
   * Content rendered in the header row to the right.
   * Use for custom icons, badges, or actions.
   */
  endContent?: ReactNode;
  /**
   * Content rendered below the progress bar track.
   * Takes precedence over `description` when both are provided.
   */
  bottomContent?: ReactNode;
  /**
   * Test ID for testing utilities.
   */
  'data-testid'?: string;
}

// =============================================================================
// Status icon mapping
// =============================================================================

const statusIconNames: Record<string, XDSIconName> = {
  canceled: 'close',
  paused: 'stop',
  success: 'success',
  warning: 'warning',
  error: 'error',
};

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
  headerLeft: {
    display: 'flex',
    alignItems: 'baseline',
    gap: spacingVars['--spacing-2'],
    minWidth: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    flexShrink: 0,
  },
  label: {
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-primary'],
  },
  labelCanceled: {
    color: colorVars['--color-text-disabled'],
  },
  valueLabel: {
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-secondary'],
  },
  valueLabelCanceled: {
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
  indeterminatePaused: {
    animationPlayState: 'paused',
  },
  description: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-secondary'],
  },
  descriptionCanceled: {
    color: colorVars['--color-text-disabled'],
  },
  bottom: {
    marginTop: `calc(-1 * ${spacingVars['--spacing-1']})`,
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
  canceled: {
    backgroundColor: colorVars['--color-text-disabled'],
  },
});

function defaultFormatValueLabel(value: number, max: number): string {
  return `${Math.round((value / max) * 100)}%`;
}

/**
 * Resolve the status icon to show based on variant, status, and completion.
 */
function resolveStatusIcon(
  variant: XDSProgressBarVariant,
  status: XDSProgressBarStatus,
  isComplete: boolean,
  isIndeterminate: boolean,
): {iconName: XDSIconName; iconColor: XDSIconColor} | null {
  if (status === 'canceled') {
    return {iconName: statusIconNames.canceled, iconColor: 'disabled'};
  }
  if (status === 'paused') {
    return {iconName: statusIconNames.paused, iconColor: 'secondary'};
  }
  if (isIndeterminate) {
    return null;
  }
  if (variant === 'success' && isComplete) {
    return {iconName: statusIconNames.success, iconColor: 'success'};
  }
  if (variant === 'warning') {
    return {iconName: statusIconNames.warning, iconColor: 'warning'};
  }
  if (variant === 'error') {
    return {iconName: statusIconNames.error, iconColor: 'error'};
  }
  return null;
}

/**
 * A progress bar for displaying determinate or indeterminate progress.
 *
 * In determinate mode, displays a known value within a range (upload progress,
 * disk usage, etc). In indeterminate mode, shows an animated loading indicator
 * for unknown progress.
 *
 * Supports semantic status states (paused, canceled) with auto-derived icons,
 * and flexible layout via description and content slots.
 *
 * Styles use XDS theme tokens via StyleX.
 * Wrap your app in <Theme> to apply a theme.
 *
 * @example
 * ```
 * <XDSProgressBar value={75} label="Upload progress" />
 * <XDSProgressBar isIndeterminate label="Loading..." />
 * <XDSProgressBar value={75} label="Upload" status="paused" hasValueLabel />
 * <XDSProgressBar value={40} label="Download" hasValueLabel
 *   description="40 MB / 100 MB downloaded" />
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
  status = 'active',
  description,
  endContent,
  bottomContent,
  xstyle,
  className,
  style,
  'data-testid': dataTestId,
  ref,
  ...rest
}: XDSProgressBarProps) {
  const labelId = useId();
  const clampedValue = Math.min(Math.max(0, value), max);
  const percentage = max > 0 ? (clampedValue / max) * 100 : 0;
  const valueText = formatValueLabel(clampedValue, max);
  const isComplete = clampedValue >= max && max > 0;
  const isCanceled = status === 'canceled';
  const isPaused = status === 'paused';

  const showValueLabel = hasValueLabel && !isIndeterminate;

  const statusIconResult = resolveStatusIcon(
    variant,
    status,
    isComplete,
    isIndeterminate,
  );

  const fillVariant = isCanceled ? 'canceled' : variant;

  const hasHeader =
    !isLabelHidden ||
    showValueLabel ||
    statusIconResult != null ||
    endContent != null;

  const hasBottom = bottomContent != null || description != null;

  return (
    <div
      ref={ref}
      {...mergeProps(
        xdsClassName('progressbar', {variant, status}),
        stylex.props(styles.container, xstyle),
        className,
        style,
      )}
      data-testid={dataTestId}
      {...rest}>
      {/* Label row */}
      {hasHeader ? (
        <div {...stylex.props(styles.header)}>
          <div {...stylex.props(styles.headerLeft)}>
            <span
              id={labelId}
              {...stylex.props(
                styles.label,
                isLabelHidden && styles.visuallyHidden,
                isCanceled && styles.labelCanceled,
              )}>
              {label}
            </span>
          </div>
          <div {...stylex.props(styles.headerRight)}>
            {statusIconResult && (
              <XDSIcon
                icon={statusIconResult.iconName}
                size="xsm"
                color={statusIconResult.iconColor}
              />
            )}
            {showValueLabel && (
              <span
                {...stylex.props(
                  styles.valueLabel,
                  isCanceled && styles.valueLabelCanceled,
                )}>
                {valueText}
              </span>
            )}
            {endContent}
          </div>
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
        {...mergeProps(
          xdsClassName('progressbar-track'),
          stylex.props(styles.track),
        )}>
        {isIndeterminate ? (
          <div
            {...mergeProps(
              xdsClassName('progressbar-fill', {variant: fillVariant}),
              stylex.props(
                styles.indeterminateFill,
                variantStyles[fillVariant],
                isPaused && styles.indeterminatePaused,
              ),
            )}
          />
        ) : (
          <div
            {...mergeProps(
              xdsClassName('progressbar-fill', {variant: fillVariant}),
              stylex.props(styles.fill, variantStyles[fillVariant]),
            )}
            style={{width: `${percentage}%`}}
          />
        )}
      </div>

      {/* Bottom content */}
      {hasBottom && (
        <div {...stylex.props(styles.bottom)}>
          {bottomContent ?? (
            <span
              {...stylex.props(
                styles.description,
                isCanceled && styles.descriptionCanceled,
              )}>
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

XDSProgressBar.displayName = 'XDSProgressBar';
