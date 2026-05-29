// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSMetricTile.tsx
 * @input Uses React, XDSText, XDSIcon, XDSHoverCard, theme tokens
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
import {XDSIcon} from '../Icon/XDSIcon';
import {XDSHoverCard} from '../HoverCard/XDSHoverCard';
import {XDSIconButton} from '../IconButton/XDSIconButton';

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
  titleRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
  },
  tabularNums: {
    fontVariantNumeric: 'tabular-nums',
  },
});

const gapStyles = stylex.create({
  sm: {gap: spacingVars['--spacing-0-5']},
  md: {gap: spacingVars['--spacing-2']},
  lg: {gap: spacingVars['--spacing-3']},
});

const paddingStyles = stylex.create({
  large: {padding: spacingVars['--spacing-6']},
  small: {padding: spacingVars['--spacing-4']},
});

const valueStyles = stylex.create({
  large: {
    fontSize: typeScaleVars['--text-heading-1-size'],
    lineHeight: typeScaleVars['--text-heading-1-leading'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-primary'],
  },
  small: {
    fontSize: typeScaleVars['--text-heading-2-size'],
    lineHeight: typeScaleVars['--text-heading-2-leading'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-primary'],
  },
});

const deltaColorStyles = stylex.create({
  favorable: {color: colorVars['--color-success']},
  unfavorable: {color: colorVars['--color-error']},
  neutral: {color: colorVars['--color-text-secondary']},
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
   * When null or undefined, displays an em-dash (—).
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
    <div
      {...stylex.props(
        styles.row,
        gapStyles.sm,
        deltaColorStyles[favorability],
      )}>
      {trend != null && (
        <span {...stylex.props(deltaIconColorStyles[favorability])}>
          <TrendArrowSvg direction={trend} width={16} height={16} />
        </span>
      )}
      {typeof value === 'string' ? (
        <XDSText type="large" color="inherit">
          {value}
        </XDSText>
      ) : (
        value
      )}
    </div>
  );
}

// =============================================================================
// Info Icon for Hovercard
// =============================================================================

const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

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
    <div {...stylex.props(styles.titleRow)}>
      <div {...stylex.props(styles.titleContent)}>
        {title != null && (
          <XDSText
            type="body"
            color="secondary"
            maxLines={numberOfTitleLines || undefined}>
            {title}
          </XDSText>
        )}
        {subtitle != null && (
          <XDSText type="supporting" color="secondary">
            {subtitle}
          </XDSText>
        )}
      </div>
      {hovercard != null && (
        <XDSHoverCard content={hovercard}>
          <XDSIconButton
            icon={<XDSIcon icon={InfoIcon} size="sm" />}
            size="sm"
            variant="ghost"
            label="More info"
          />
        </XDSHoverCard>
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
        {value == null ? '—' : formatter(value)}
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
          titlePosition === 'top' ? gapStyles.lg : gapStyles.md,
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
