// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSChartSwatch.tsx
 * @output Color swatch primitive for legends, tooltips, and standalone use
 * @position Composable primitive — used by XDSChartLegend (and future
 *           XDSChartTooltip), or independently anywhere a series indicator
 *           is needed.
 *
 * @example
 * ```
 * <XDSChartSwatch color="#3b82f6" variant="square" />
 * <XDSChartSwatch color="#f59e0b" variant="line" />
 * ```
 */

import {memo} from 'react';
import * as stylex from '@stylexjs/stylex';

/**
 * Visual variant — drives shape.
 * - `'square'` — square chip (bar series)
 * - `'line'` — short stroke (line, dot, area, and other non-bar series)
 */
export type XDSChartSwatchVariant = 'square' | 'line';

export interface XDSChartSwatchProps {
  /** Fill color — typically a series color token */
  color: string;
  /** Visual variant. Default: `'square'`. */
  variant?: XDSChartSwatchVariant;
}

const styles = stylex.create({
  base: {
    flexShrink: 0,
  },
  square: {
    width: 8,
    height: 8,
    borderRadius: 2,
    marginInline: 1,
  },
  line: {
    width: 10,
    height: 3,
    borderRadius: 1.5,
  },
});

/**
 * Color swatch primitive.
 *
 * Used by XDSChartLegend (and XDSChartTooltip) to render the colored
 * indicator next to a series label. Exported as a primitive so consumers
 * can build their own custom legend/tooltip layouts while keeping visuals
 * consistent.
 */
function XDSChartSwatchImpl({color, variant = 'square'}: XDSChartSwatchProps) {
  return (
    <div
      aria-hidden
      {...stylex.props(styles.base, styles[variant])}
      style={{backgroundColor: color}}
    />
  );
}

/**
 * Memoized — swatches are static for a given (color, variant) tuple
 * and can render many times in a tooltip/legend with several series.
 */
export const XDSChartSwatch = memo(XDSChartSwatchImpl);

/**
 * Map a SeriesDef.type string to its swatch variant.
 *
 * Bar series get a square chip; everything else (line, dot, area, and any
 * other non-bar mark) gets a short stroke. Centralized so legend, tooltip,
 * and any custom chrome stay consistent.
 */
export function swatchVariantForType(
  type: string | undefined,
): XDSChartSwatchVariant {
  return type === 'bar' ? 'square' : 'line';
}
