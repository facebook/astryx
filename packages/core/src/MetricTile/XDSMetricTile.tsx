// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSMetricTile.tsx
 * @input Uses React, XDSText, XDSHoverCard, theme tokens
 * @output Exports XDSMetricTile component and related types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/MetricTile/MetricTile.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/MetricTile/XDSMetricTile.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/MetricTile/index.ts (exports if types change)
 * - /apps/storybook/stories/MetricTile.stories.tsx (storybook stories)
 */

import type {ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
  fontWeightVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {XDSText} from '../Text/XDSText';
import {truncationStyles} from '../Text/text.stylex';
import {XDSHoverCard} from '../HoverCard/XDSHoverCard';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    minWidth: 86,
    textAlign: 'start',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
  },
  titleLine: {
    display: 'inline',
  },
  helpIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    height: spacingVars['--spacing-5'],
    marginInlineStart: spacingVars['--spacing-1'],
  },
  helpButton: {
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    padding: 0,
    cursor: 'pointer',
    color: colorVars['--color-icon-secondary'],
  },
  tabularNums: {
    fontVariantNumeric: 'tabular-nums',
  },
  title: {
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    fontWeight: typeScaleVars['--text-body-weight'],
    color: colorVars['--color-text-primary'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  subtitle: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontWeight: typeScaleVars['--text-supporting-weight'],
    color: colorVars['--color-text-secondary'],
  },
});

const gapStyles = stylex.create({
  sm: {gap: spacingVars['--spacing-0-5']},
  md: {gap: spacingVars['--spacing-2']},
  titleBottom: {gap: 0},
  titleTop: {gap: spacingVars['--spacing-2']},
});

const paddingStyles = stylex.create({
  large: {padding: spacingVars['--spacing-6']},
  small: {padding: spacingVars['--spacing-4']},
});

const valueStyles = stylex.create({
  large: {
    fontSize: typeScaleVars['--text-display-2-size'],
    lineHeight: typeScaleVars['--text-display-2-leading'],
    fontWeight: typeScaleVars['--text-display-2-weight'],
    color: colorVars['--color-text-primary'],
  },
  small: {
    fontSize: typeScaleVars['--text-heading-1-size'],
    lineHeight: typeScaleVars['--text-heading-1-leading'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-primary'],
  },
});

const deltaIconColorStyles = stylex.create({
  favorable: {color: colorVars['--color-success']},
  unfavorable: {color: colorVars['--color-error']},
  neutral: {color: colorVars['--color-icon-secondary']},
});

// =============================================================================
// Types
// =============================================================================

export type XDSMetricTileSize = 'large' | 'small';
export type XDSMetricTileTitlePosition = 'top' | 'bottom';

export type XDSMetricTileFormat =
  | 'prettyMetric'
  | 'prettyBytes'
  | 'prettyInt'
  | ((value: number) => ReactNode);

export type XDSMetricDeltaTrend = 'upward' | 'downward' | 'flat';
export type XDSMetricDeltaFavorability =
  | 'favorable'
  | 'unfavorable'
  | 'neutral';

export interface XDSMetricTileProps extends XDSBaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * The metric value to display.
   * When null or undefined, displays a double hyphen (--).
   */
  value: number | null | undefined;
  /**
   * Metric title text.
   */
  title?: ReactNode;
  /**
   * Optional metric subtitle.
   */
  subtitle?: ReactNode;
  /**
   * Formatter for the numeric value.
   * Built-in formatters: 'prettyMetric' (1.2K/1.2M), 'prettyInt' (1,234), 'prettyBytes' (1.2 KB).
   * Or pass a custom function: (value: number) => ReactNode.
   * @default 'prettyMetric'
   */
  format?: XDSMetricTileFormat;
  /**
   * Delta value to display next to the metric (e.g. "+12.5%").
   */
  deltaValue?: ReactNode;
  /**
   * Trend direction for the delta indicator arrow.
   */
  deltaTrend?: XDSMetricDeltaTrend;
  /**
   * Favorability of the delta for color coding.
   * 'favorable' renders green, 'unfavorable' renders red, 'neutral' renders gray.
   */
  deltaFavorability?: XDSMetricDeltaFavorability;
  /**
   * Size variant.
   * @default 'large'
   */
  size?: XDSMetricTileSize;
  /**
   * Display title above or below the metric value.
   * @default 'bottom'
   */
  titlePosition?: XDSMetricTileTitlePosition;
  /**
   * Whether to add padding around the component.
   * @default true
   */
  hasPadding?: boolean;
  /**
   * Use tabular (fixed-width) numbers for consistent alignment.
   * @default false
   */
  hasTabularNumbers?: boolean;
  /**
   * Maximum number of lines for the title before truncating.
   * 0 disables truncation.
   * @default 0
   */
  numberOfTitleLines?: number;
  /**
   * Content for an info hovercard displayed next to the title.
   */
  hovercard?: ReactNode;
}

// =============================================================================
// Number Formatters
// =============================================================================

const SI_SUFFIXES = ['', 'K', 'M', 'B', 'T'] as const;
const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

function prettyMetric(value: number): string {
  if (value === 0) {
    return '0';
  }
  const isNeg = value < 0;
  let abs = Math.abs(value);
  let idx = 0;
  while (abs >= 1000 && idx < SI_SUFFIXES.length - 1) {
    abs /= 1000;
    idx++;
  }
  const formatted =
    idx === 0 ? abs.toLocaleString() : `${parseFloat(abs.toPrecision(3))}`;
  return `${isNeg ? '-' : ''}${formatted}${SI_SUFFIXES[idx]}`;
}

function prettyInt(value: number): string {
  return Math.round(value).toLocaleString();
}

function prettyBytes(value: number): string {
  if (value === 0) {
    return '0 B';
  }
  const isNeg = value < 0;
  let abs = Math.abs(value);
  let idx = 0;
  while (abs >= 1024 && idx < BYTE_UNITS.length - 1) {
    abs /= 1024;
    idx++;
  }
  const formatted =
    idx === 0 ? abs.toString() : parseFloat(abs.toPrecision(3)).toString();
  return `${isNeg ? '-' : ''}${formatted} ${BYTE_UNITS[idx]}`;
}

function getFormatter(
  format: XDSMetricTileFormat,
): (value: number) => ReactNode {
  switch (format) {
    case 'prettyMetric':
      return prettyMetric;
    case 'prettyInt':
      return prettyInt;
    case 'prettyBytes':
      return prettyBytes;
    default:
      return format;
  }
}

// =============================================================================
// Delta Indicator
// =============================================================================

const TREND_PATHS: Record<XDSMetricDeltaTrend, string> = {
  upward: 'M7 14l5-5 5 5',
  downward: 'M7 10l5 5 5-5',
  flat: 'M5 12h14',
};

function TrendArrowSvg({
  direction,
  ...props
}: {direction: XDSMetricDeltaTrend} & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}>
      <path d={TREND_PATHS[direction]} />
    </svg>
  );
}

const deltaGapStyle = stylex.create({
  root: {gap: spacingVars['--spacing-1']},
});

function DeltaIndicator({
  trend,
  favorability = 'neutral',
  value,
}: {
  trend?: XDSMetricDeltaTrend;
  favorability?: XDSMetricDeltaFavorability;
  value?: ReactNode;
}) {
  return (
    <div {...stylex.props(styles.row, deltaGapStyle.root)}>
      {trend != null && (
        <span {...stylex.props(deltaIconColorStyles[favorability])}>
          <TrendArrowSvg direction={trend} width={16} height={16} />
        </span>
      )}
      {typeof value === 'string' ? (
        <XDSText type="body" color="secondary">
          {value}
        </XDSText>
      ) : (
        value
      )}
    </div>
  );
}

// =============================================================================
// Info Icon for Hovercard (12px filled info-circle, matching www XDSHelpMessage)
// =============================================================================

function InfoCircle12() {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden="true">
      <path d="M6 0a6 6 0 1 0 0 12A6 6 0 0 0 6 0zm.75 9h-1.5V5.25h1.5V9zm0-4.5h-1.5v-1.5h1.5v1.5z" />
    </svg>
  );
}

// =============================================================================
// Title Text (handles truncation + style merging)
// =============================================================================

function TitleText({
  numberOfLines,
  children,
}: {
  numberOfLines: number;
  children: ReactNode;
}) {
  const stylexResult = stylex.props(
    styles.title,
    numberOfLines === 1 && truncationStyles.singleLine,
    numberOfLines > 1 && truncationStyles.multiLine,
  );

  const mergedStyle =
    numberOfLines > 1
      ? {...stylexResult.style, WebkitLineClamp: numberOfLines}
      : stylexResult.style;

  return (
    <span className={stylexResult.className} style={mergedStyle}>
      {children}
    </span>
  );
}

// =============================================================================
// Component
// =============================================================================

/**
 * A large KPI value displayed with a title, optional subtitle, and optional
 * delta indicator showing trend direction and favorability.
 *
 * @example
 * ```
 * <XDSMetricTile value={1250} title="Revenue" subtitle="This month" />
 * <XDSMetricTile
 *   value={42}
 *   title="Response Time"
 *   format="prettyInt"
 *   deltaValue="+12.5%"
 *   deltaTrend="upward"
 *   deltaFavorability="favorable"
 * />
 * <XDSMetricTile value={50} format={v => v + '%'} title="Completion" />
 * ```
 */
export function XDSMetricTile({
  value,
  title,
  subtitle,
  format = 'prettyMetric',
  deltaValue,
  deltaTrend,
  deltaFavorability,
  size = 'large',
  titlePosition = 'bottom',
  hasPadding = true,
  hasTabularNumbers = false,
  numberOfTitleLines = 0,
  hovercard,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSMetricTileProps) {
  const formatter = getFormatter(format);

  const titleBlock = (title != null || subtitle != null) && (
    <div {...stylex.props(styles.titleBlock)}>
      <div {...stylex.props(styles.titleLine)}>
        {title != null && (
          <TitleText numberOfLines={numberOfTitleLines}>{title}</TitleText>
        )}
        {hovercard != null && (
          <XDSHoverCard content={hovercard}>
            <span {...stylex.props(styles.helpIcon)}>
              <button
                type="button"
                aria-label="Help Message"
                {...stylex.props(styles.helpButton)}>
                <InfoCircle12 />
              </button>
            </span>
          </XDSHoverCard>
        )}
      </div>
      {subtitle != null && (
        <span {...stylex.props(styles.subtitle)}>{subtitle}</span>
      )}
    </div>
  );

  const valueBlock = (
    <div {...stylex.props(styles.row, gapStyles.md)}>
      <div
        {...mergeProps(
          xdsClassName('metric-tile-value'),
          stylex.props(valueStyles[size]),
        )}
        data-testid={
          props['data-testid'] ? `${props['data-testid']}-value` : undefined
        }>
        {value == null ? '--' : formatter(value)}
      </div>
      {(deltaTrend != null || deltaValue != null) && (
        <DeltaIndicator
          trend={deltaTrend}
          favorability={deltaFavorability}
          value={deltaValue}
        />
      )}
    </div>
  );

  return (
    <div
      ref={ref}
      {...mergeProps(
        xdsClassName('metric-tile', {size}),
        stylex.props(
          styles.root,
          styles.column,
          titlePosition === 'top' ? gapStyles.titleTop : gapStyles.titleBottom,
          hasPadding && paddingStyles[size],
          hasTabularNumbers && styles.tabularNums,
          xstyle,
        ),
        className,
        style,
      )}
      {...props}>
      {titlePosition === 'top' && titleBlock}
      {valueBlock}
      {titlePosition !== 'top' && titleBlock}
    </div>
  );
}

XDSMetricTile.displayName = 'XDSMetricTile';
