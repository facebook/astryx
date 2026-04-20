/**
 * @file useXDSChartStack.ts
 * @output Hook for reading stacked baselines from chart context
 * @position Used by XDSChartBar and XDSChartArea when `stack` prop is set
 */

import {useChart} from './ChartContext';

/**
 * Hook that reads pre-computed stacked baselines for a series.
 * The stack layout is computed in XDSChart from yKeys using d3-stack.
 * Returns y0 (bottom) and y1 (top) accessors for each data point index.
 */
export function useXDSChartStack(
  stackGroup: string | undefined,
  dataKey: string,
): {
  y0: (index: number) => number;
  y1: (index: number) => number;
  isStacked: boolean;
} {
  const {stackLayout, yScale, data} = useChart();

  if (!stackGroup || !stackLayout) {
    return {
      y0: () => yScale(0),
      y1: (index: number) => {
        const v = data[index]?.[dataKey];
        return yScale(typeof v === 'number' ? v : 0);
      },
      isStacked: false,
    };
  }

  const series = stackLayout.get(dataKey);
  if (!series) {
    return {
      y0: () => yScale(0),
      y1: (index: number) => {
        const v = data[index]?.[dataKey];
        return yScale(typeof v === 'number' ? v : 0);
      },
      isStacked: false,
    };
  }

  return {
    y0: (index: number) => yScale(series.y0[index] ?? 0),
    y1: (index: number) => yScale(series.y1[index] ?? 0),
    isStacked: true,
  };
}
