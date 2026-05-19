// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file marks/referenceLine.tsx
 * @output Horizontal or vertical reference line/band annotation
 */

import type {SeriesDef} from '../types';
import type {ScaleLinear} from 'd3-scale';

export interface ReferenceLineOptions {
  /** Horizontal reference at this y value */
  y?: number;
  /** Second y value — draws a shaded band between y and y2 */
  y2?: number;
  /** Vertical reference at this x value */
  x?: number;
  /** Line/band color */
  color?: string;
  /** Stroke width (for lines) */
  strokeWidth?: number;
  /** Dash pattern */
  strokeDasharray?: string;
  /** Text label */
  label?: string;
  /** Label position */
  labelPosition?: 'start' | 'end';
  /** Band fill opacity (when y2 is set) */
  bandOpacity?: number;
}

/**
 * Reference line or band annotation. Not a data series — renders at fixed values.
 *
 * @example
 * ```
 * series={[line('revenue'), referenceLine({y: 100, label: 'Target'})]}
 * ```
 */
export function referenceLine(options: ReferenceLineOptions): SeriesDef {
  const color = options.color ?? 'var(--color-border-emphasized)';
  const strokeWidth = options.strokeWidth ?? 1;
  const strokeDasharray = options.strokeDasharray ?? '6 3';
  const label = options.label;
  const labelPosition = options.labelPosition ?? 'end';
  const bandOpacity = options.bandOpacity ?? 0.1;

  // Badge dimensions — matches crosshair label style
  const badgeH = 14;
  const badgeRx = 3;
  const fontSize = 10;

  return {
    type: 'referenceLine',
    key: `ref-${options.y ?? options.x ?? 'none'}`,
    dataKeys: [],
    layout: {},

    // No data points to resolve — this is a fixed annotation
    resolve() {
      return [];
    },

    render(_resolved, ctx) {
      const {width, height, xScale, yScale} = ctx;

      // Horizontal reference line or band
      if (options.y != null) {
        const py = yScale(options.y);
        const textW = label ? label.length * 5.5 + 8 : 0;
        const bx = labelPosition === 'end' ? width - textW - 2 : 2;

        // Band mode: shaded region between y and y2
        if (options.y2 != null) {
          const py2 = yScale(options.y2);
          const top = Math.min(py, py2);
          const bandHeight = Math.abs(py2 - py);
          return (
            <g>
              <rect
                x={0}
                y={top}
                width={width}
                height={bandHeight}
                fill={color}
                opacity={bandOpacity}
              />
              <line
                x1={0}
                x2={width}
                y1={py}
                y2={py}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
              />
              <line
                x1={0}
                x2={width}
                y1={py2}
                y2={py2}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
              />
              {label && (
                <g transform={`translate(${bx},${py})`} pointerEvents="none">
                  <rect
                    x={0}
                    y={-badgeH / 2}
                    width={textW}
                    height={badgeH}
                    rx={badgeRx}
                    fill="var(--color-background-popover)"
                    fillOpacity={0.85}
                    stroke={color}
                    strokeWidth={0.5}
                  />
                  <text
                    x={textW / 2}
                    dy="0.35em"
                    textAnchor="middle"
                    fontSize={fontSize}
                    fontWeight={500}
                    fill={color}>
                    {label}
                  </text>
                </g>
              )}
            </g>
          );
        }

        // Single horizontal line
        return (
          <g>
            <line
              x1={0}
              x2={width}
              y1={py}
              y2={py}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
            />
            {label && (
              <g transform={`translate(${bx},${py})`} pointerEvents="none">
                <rect
                  x={0}
                  y={-badgeH / 2}
                  width={textW}
                  height={badgeH}
                  rx={badgeRx}
                  fill="var(--color-background-popover)"
                  fillOpacity={0.85}
                  stroke={color}
                  strokeWidth={0.5}
                />
                <text
                  x={textW / 2}
                  dy="0.35em"
                  textAnchor="middle"
                  fontSize={fontSize}
                  fontWeight={500}
                  fill={color}>
                  {label}
                </text>
              </g>
            )}
          </g>
        );
      }

      // Vertical reference line
      if (options.x != null && !('bandwidth' in xScale)) {
        const px = (xScale as ScaleLinear<number, number>)(options.x);
        const textW = label ? label.length * 5.5 + 8 : 0;
        const by = labelPosition === 'end' ? 4 : height - badgeH - 4;
        return (
          <g>
            <line
              x1={px}
              x2={px}
              y1={0}
              y2={height}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
            />
            {label && (
              <g
                transform={`translate(${px - textW / 2},${by})`}
                pointerEvents="none">
                <rect
                  x={0}
                  y={0}
                  width={textW}
                  height={badgeH}
                  rx={badgeRx}
                  fill="var(--color-background-popover)"
                  fillOpacity={0.85}
                  stroke={color}
                  strokeWidth={0.5}
                />
                <text
                  x={textW / 2}
                  y={badgeH / 2}
                  dy="0.35em"
                  textAnchor="middle"
                  fontSize={fontSize}
                  fontWeight={500}
                  fill={color}>
                  {label}
                </text>
              </g>
            )}
          </g>
        );
      }

      return null;
    },
  };
}
