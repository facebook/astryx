// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useChartRange.ts
 * @output Hook that tracks streaming data ranges and provides domains for Chart
 * @position Helper hook; sits between the data source and Chart props
 *
 * Manages xDomain/yDomain as state. Domain updates are synchronous with
 * every push — no throttling. The chart's declared domain must always
 * match the data being rendered (Tier 1 guarantee).
 */

import {useState, useRef, useCallback} from 'react';
import type {ChartStreamGLHandle} from './ChartStreamGL';

export interface UseChartRangeOptions {
  /** Sliding window size for x-axis (number of ticks visible). Required. */
  xWindow: number;
  /**
   * Fixed y-axis domain. When provided, y auto-tracking is disabled.
   * Use when the range is known (e.g. 0-100 for percentages).
   */
  yDomain?: [number, number];
  /**
   * Padding factor for auto-tracked y-axis (default: 0.1 = 10%).
   * Applied symmetrically above max and below min.
   */
  yPadding?: number;
  /**
   * Anchor y=0 in the center of the y-axis (default: false).
   * When true, y-domain is always symmetric around 0.
   */
  yCenter?: boolean;
}

export interface UseChartRangeReturn {
  /** Current x-axis domain — pass to Chart xDomain prop */
  xDomain: [number, number];
  /** Current y-axis domain — pass to Chart yDomain prop */
  yDomain: [number, number];
  /**
   * Push a data point. Updates domains synchronously, then optionally
   * forwards to a stream ref.
   */
  push(
    x: number,
    y: number,
    streamRef?: React.RefObject<ChartStreamGLHandle | null>,
  ): void;
  /** Reset all tracking state */
  reset(): void;
}

/**
 * Tracks streaming data ranges and provides xDomain/yDomain for Chart.
 *
 * Domain updates are synchronous with every push — no throttling, no lag.
 * This ensures the chart's declared domain always matches the rendered data.
 *
 * @example
 * ```
 * const {xDomain, yDomain, push} = useChartRange({xWindow: 300, yPadding: 0.1});
 *
 * <Chart xDomain={xDomain} yDomain={yDomain} ...>
 *   <ChartStreamGL handleRef={streamRef} ... />
 * </Chart>
 * ```
 */
export function useChartRange({
  xWindow,
  yDomain: fixedYDomain,
  yPadding = 0.1,
  yCenter = false,
}: UseChartRangeOptions): UseChartRangeReturn {
  const [xDomain, setXDomain] = useState<[number, number]>([0, 0]);
  const [yDomain, setYDomain] = useState<[number, number]>(
    fixedYDomain ?? [0, 1],
  );

  const rangeRef = useRef({
    yMin: fixedYDomain ? fixedYDomain[0] : Infinity,
    yMax: fixedYDomain ? fixedYDomain[1] : -Infinity,
  });

  const push = useCallback(
    (
      x: number,
      y: number,
      streamRef?: React.RefObject<ChartStreamGLHandle | null>,
    ) => {
      // Forward to stream
      streamRef?.current?.push(x, y);

      // x domain: during warmup grow from [0, x], once full slide
      const xMin = x >= xWindow ? x - xWindow : 0;
      const xMax = x >= xWindow ? x : Math.max(x, 1);
      setXDomain([xMin, xMax]);

      // y domain: track min/max, update on every push
      if (!fixedYDomain) {
        const r = rangeRef.current;
        let changed = false;
        if (y < r.yMin) {
          r.yMin = y;
          changed = true;
        }
        if (y > r.yMax) {
          r.yMax = y;
          changed = true;
        }

        if (changed) {
          const range = r.yMax - r.yMin || 1;
          const pad = range * yPadding;
          let min = r.yMin - pad;
          let max = r.yMax + pad;

          if (yCenter) {
            const abs = Math.max(Math.abs(min), Math.abs(max));
            min = -abs;
            max = abs;
          }

          setYDomain([min, max]);
        }
      }
    },
    [xWindow, fixedYDomain, yPadding, yCenter],
  );

  const reset = useCallback(() => {
    rangeRef.current = {
      yMin: fixedYDomain ? fixedYDomain[0] : Infinity,
      yMax: fixedYDomain ? fixedYDomain[1] : -Infinity,
    };
    setXDomain([0, 0]);
    setYDomain(fixedYDomain ?? [0, 1]);
  }, [fixedYDomain]);

  return {
    xDomain,
    yDomain: fixedYDomain ?? yDomain,
    push,
    reset,
  };
}
