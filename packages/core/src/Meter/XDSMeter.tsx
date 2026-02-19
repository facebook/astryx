/**
 * @file XDSMeter.tsx
 * @input Uses React forwardRef, useId, stylex, color/spacing/radius/transition tokens
 * @output Exports XDSMeter component, XDSMeterProps, XDSMeterVariant, XDSMeterSize types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Meter/README.md (props table, features, implementation notes)
 * - /packages/core/src/Meter/XDSMeter.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Meter/index.ts (exports if types change)
 * - /apps/storybook/stories/Meter.stories.tsx (storybook stories)
 */

import {forwardRef, useId} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  textSizeVars,
  fontWeightVars,
  lineHeightVars,
  transitionVars,
} from '../theme/tokens.stylex';

/**
 * Meter variant type — maps to semantic color tokens.
 */
export type XDSMeterVariant = 'accent' | 'positive' | 'warning' | 'negative';

/**
 * Meter size type — controls track height.
 */
export type XDSMeterSize = 'sm' | 'md' | 'lg';

export interface XDSMeterProps {
  /**
   * Current value of the meter.
   */
  value: number;
  /**
   * Maximum value of the meter.
   * @default 100
   */
  max?: number;
  /**
   * Accessible label for the meter. Required for a11y.
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
  variant?: XDSMeterVariant;
  /**
   * Size of the meter track.
   * - sm: 4px
   * - md: 8px
   * - lg: 12px
   * @default 'md'
   */
  size?: XDSMeterSize;
  /**
   * StyleX styles to apply to the outer container.
   */
  xstyle?: StyleXStyles;
  /**
   * Test ID for testing utilities.
   */
  'data-testid'?: string;
}

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
    fontSize: textSizeVars['--text-sm'],
    lineHeight: lineHeightVars['--leading-snug'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-primary'],
  },
  valueLabel: {
    fontSize: textSizeVars['--text-sm'],
    lineHeight: lineHeightVars['--leading-snug'],
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
    backgroundColor: colorVars['--color-deemphasized'],
    borderRadius: radiusVars['--radius-rounded'],
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radiusVars['--radius-rounded'],
    transitionProperty: 'width',
    transitionDuration: transitionVars['--transition-normal'],
  },
});

const sizeStyles = stylex.create({
  sm: {
    height: '4px',
  },
  md: {
    height: '8px',
  },
  lg: {
    height: '12px',
  },
});

const variantStyles = stylex.create({
  accent: {
    backgroundColor: colorVars['--color-accent'],
  },
  positive: {
    backgroundColor: colorVars['--color-positive'],
  },
  warning: {
    backgroundColor: colorVars['--color-warning'],
  },
  negative: {
    backgroundColor: colorVars['--color-negative'],
  },
});

function defaultFormatValueLabel(value: number, max: number): string {
  return `${Math.round((value / max) * 100)}%`;
}

/**
 * A determinate progress/meter indicator bar.
 *
 * Displays a known value within a range, such as disk usage, battery level,
 * or completion percentage. Uses `role="meter"` with full ARIA attributes.
 *
 * Styles use XDS theme tokens via StyleX.
 * Wrap your app in <Theme> to apply a theme.
 *
 * @example
 * ```tsx
 * <XDSMeter value={75} label="Upload progress" />
 * <XDSMeter value={3.2} max={5} label="Disk usage" hasValueLabel
 *   formatValueLabel={(v, m) => `${v} GB / ${m} GB`} />
 * ```
 */
export const XDSMeter = forwardRef<HTMLDivElement, XDSMeterProps>(
  function XDSMeter(
    {
      value,
      max = 100,
      label,
      isLabelHidden = false,
      hasValueLabel = false,
      formatValueLabel = defaultFormatValueLabel,
      variant = 'accent',
      size = 'md',
      xstyle,
      'data-testid': dataTestId,
    },
    ref,
  ) {
    const labelId = useId();
    const clampedValue = Math.min(Math.max(0, value), max);
    const percentage = max > 0 ? (clampedValue / max) * 100 : 0;
    const valueText = formatValueLabel(clampedValue, max);

    return (
      <div
        ref={ref}
        {...stylex.props(styles.container, xstyle)}
        data-testid={dataTestId}>
        {/* Label row */}
        {!isLabelHidden || hasValueLabel ? (
          <div {...stylex.props(styles.header)}>
            <span
              id={labelId}
              {...stylex.props(
                styles.label,
                isLabelHidden && styles.visuallyHidden,
              )}>
              {label}
            </span>
            {hasValueLabel && (
              <span {...stylex.props(styles.valueLabel)}>{valueText}</span>
            )}
          </div>
        ) : (
          <span id={labelId} {...stylex.props(styles.visuallyHidden)}>
            {label}
          </span>
        )}

        {/* Meter track */}
        <div
          role="meter"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-labelledby={labelId}
          aria-valuetext={valueText}
          {...stylex.props(styles.track, sizeStyles[size])}>
          <div
            {...stylex.props(styles.fill, variantStyles[variant])}
            style={{width: `${percentage}%`}}
          />
        </div>
      </div>
    );
  },
);

XDSMeter.displayName = 'XDSMeter';
