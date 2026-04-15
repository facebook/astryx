import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSChart,
  XDSChartAxis,
  XDSChartGrid,
  XDSChartBar,
  XDSChartLine,
  XDSChartDot,
  XDSChartArea,
  XDSChartErrorBar,
  XDSChartCandlestick,
  XDSChartTooltip,
  XDSChartLegend,
  XDSChartColors,
} from '@xds/lab';

/**
 * `XDSChart` is the root container for all chart components. It computes
 * scales from data and provides them to children via React context.
 *
 * All child components (marks, axes, grid, tooltips) read from this shared
 * context — ensuring every element maps data to pixels through the same
 * coordinate space.
 *
 * ## Key Props
 *
 * - `data` — array of objects with consistent keys
 * - `xKey` — key for x-axis values (string = band scale, number = linear)
 * - `yKeys` — key(s) used to compute y-domain
 * - `yDomain` — explicit y-axis range `[min, max]` (data can still expand beyond)
 * - `yBaseline` — `'auto'` | `'zero'` | `'data'`
 * - `height` — chart height in pixels (width is responsive)
 *
 * ## Composition
 *
 * Charts are built by composing mark, axis, and interaction components:
 *
 * ```tsx
 * <XDSChart data={data} xKey="month" yKeys={['revenue']}>
 *   <XDSChartGrid horizontal />
 *   <XDSChartAxis position="bottom" />
 *   <XDSChartAxis position="left" />
 *   <XDSChartBar dataKey="revenue" color={colors[0]} />
 *   <XDSChartTooltip />
 * </XDSChart>
 * ```
 */
const meta: Meta<typeof XDSChart> = {
  title: 'Lab/XDSChart',
  component: XDSChart,
  tags: ['autodocs'],
  argTypes: {
    height: {control: {type: 'number', min: 100, max: 600, step: 50}},
    yBaseline: {control: 'select', options: ['auto', 'zero', 'data']},
  },
};

export default meta;

const monthlyData = [
  {month: 'Jan', revenue: 4200, expenses: 2800, trend: 3800},
  {month: 'Feb', revenue: 3800, expenses: 2600, trend: 3900},
  {month: 'Mar', revenue: 5100, expenses: 3200, trend: 4200},
  {month: 'Apr', revenue: 4600, expenses: 2900, trend: 4400},
  {month: 'May', revenue: 5400, expenses: 3100, trend: 4600},
  {month: 'Jun', revenue: 6200, expenses: 3400, trend: 5000},
];

const colors = XDSChartColors.categorical(3);

/** Basic bar chart with axes, grid, and tooltip. */
export const BarChart: StoryObj = {
  render: () => (
    <XDSChart data={monthlyData} xKey="month" yKeys={['revenue']} height={300}>
      <XDSChartGrid horizontal />
      <XDSChartAxis position="bottom" />
      <XDSChartAxis position="left" />
      <XDSChartBar dataKey="revenue" color={colors[0]} />
      <XDSChartTooltip />
    </XDSChart>
  ),
};

/** Line chart with dots and a two-series legend. */
export const LineChart: StoryObj = {
  render: () => (
    <XDSChart
      data={monthlyData}
      xKey="month"
      yKeys={['revenue', 'expenses']}
      height={300}>
      <XDSChartGrid horizontal />
      <XDSChartAxis position="bottom" />
      <XDSChartAxis position="left" />
      <XDSChartLine dataKey="revenue" color={colors[0]} dots />
      <XDSChartLine dataKey="expenses" color={colors[1]} dots />
      <XDSChartLegend
        items={[
          {label: 'Revenue', color: colors[0]},
          {label: 'Expenses', color: colors[1]},
        ]}
      />
      <XDSChartTooltip />
    </XDSChart>
  ),
};

/** Mixed bar + line on the same chart — both map through the same yScale. */
export const MixedChart: StoryObj = {
  render: () => (
    <XDSChart
      data={monthlyData}
      xKey="month"
      yKeys={['revenue', 'trend']}
      height={300}>
      <XDSChartGrid horizontal />
      <XDSChartAxis position="bottom" />
      <XDSChartAxis position="left" />
      <XDSChartBar dataKey="revenue" color={colors[0]} />
      <XDSChartLine dataKey="trend" color={colors[2]} dots />
      <XDSChartLegend
        items={[
          {label: 'Revenue', color: colors[0]},
          {label: 'Trend', color: colors[2]},
        ]}
      />
      <XDSChartTooltip />
    </XDSChart>
  ),
};

/** Scatter plot with two dot series. */
export const ScatterPlot: StoryObj = {
  render: () => (
    <XDSChart
      data={monthlyData}
      xKey="month"
      yKeys={['revenue', 'expenses']}
      height={300}>
      <XDSChartGrid horizontal vertical />
      <XDSChartAxis position="bottom" />
      <XDSChartAxis position="left" />
      <XDSChartDot dataKey="revenue" color={colors[0]} radius={5} />
      <XDSChartDot dataKey="expenses" color={colors[1]} radius={5} />
      <XDSChartLegend
        items={[
          {label: 'Revenue', color: colors[0]},
          {label: 'Expenses', color: colors[1]},
        ]}
      />
      <XDSChartTooltip />
    </XDSChart>
  ),
};

// --- Confidence intervals ---
const ciData = [
  {month: 'Jan', mean: 42, upper95: 52, lower95: 32},
  {month: 'Feb', mean: 38, upper95: 50, lower95: 26},
  {month: 'Mar', mean: 51, upper95: 62, lower95: 40},
  {month: 'Apr', mean: 46, upper95: 58, lower95: 34},
  {month: 'May', mean: 54, upper95: 66, lower95: 42},
  {month: 'Jun', mean: 62, upper95: 74, lower95: 50},
];

/** Line with 95% confidence band using XDSChartArea. */
export const ConfidenceBand: StoryObj = {
  render: () => (
    <XDSChart
      data={ciData}
      xKey="month"
      yKeys={['upper95', 'lower95']}
      height={300}>
      <XDSChartGrid horizontal />
      <XDSChartAxis position="bottom" />
      <XDSChartAxis position="left" />
      <XDSChartArea
        yUpper="upper95"
        yLower="lower95"
        color={colors[0]}
        opacity={0.15}
      />
      <XDSChartLine dataKey="mean" color={colors[0]} dots />
      <XDSChartTooltip />
    </XDSChart>
  ),
};

// --- Error bars ---
const errorData = [
  {cat: 'A', value: 45, upper: 52, lower: 38},
  {cat: 'B', value: 62, upper: 70, lower: 54},
  {cat: 'C', value: 38, upper: 48, lower: 28},
  {cat: 'D', value: 55, upper: 60, lower: 50},
];

/** Bar chart with whisker error bars. */
export const WithErrorBars: StoryObj = {
  render: () => (
    <XDSChart
      data={errorData}
      xKey="cat"
      yKeys={['upper', 'lower']}
      height={300}>
      <XDSChartGrid horizontal />
      <XDSChartAxis position="bottom" />
      <XDSChartAxis position="left" />
      <XDSChartBar dataKey="value" color={colors[0]} />
      <XDSChartErrorBar yUpper="upper" yLower="lower" />
    </XDSChart>
  ),
};

// --- Candlestick ---
const ohlcData = [
  {day: 'Mon', open: 100, close: 108, high: 112, low: 98},
  {day: 'Tue', open: 108, close: 103, high: 110, low: 101},
  {day: 'Wed', open: 103, close: 110, high: 115, low: 100},
  {day: 'Thu', open: 110, close: 106, high: 113, low: 104},
  {day: 'Fri', open: 106, close: 114, high: 118, low: 105},
];

/** OHLC candlestick — default filled variant. */
export const Candlestick: StoryObj = {
  render: () => (
    <XDSChart
      data={ohlcData}
      xKey="day"
      yKeys={['high', 'low']}
      yBaseline="data"
      height={300}>
      <XDSChartGrid horizontal />
      <XDSChartAxis position="bottom" />
      <XDSChartAxis position="left" />
      <XDSChartCandlestick high="high" low="low" open="open" close="close" />
    </XDSChart>
  ),
};

/** OHLC bar variant — vertical line with open/close ticks. */
export const CandlestickBar: StoryObj = {
  render: () => (
    <XDSChart
      data={ohlcData}
      xKey="day"
      yKeys={['high', 'low']}
      yBaseline="data"
      height={300}>
      <XDSChartGrid horizontal />
      <XDSChartAxis position="bottom" />
      <XDSChartAxis position="left" />
      <XDSChartCandlestick
        variant="bar"
        high="high"
        low="low"
        open="open"
        close="close"
        color={colors[0]}
      />
    </XDSChart>
  ),
};

// --- Zero-centered ---
const plData = [
  {month: 'Jan', profit: 12},
  {month: 'Feb', profit: -8},
  {month: 'Mar', profit: 22},
  {month: 'Apr', profit: -15},
  {month: 'May', profit: 5},
  {month: 'Jun', profit: -3},
];

/** Positive/negative bars with yBaseline="zero" for symmetric axis. */
export const ZeroCentered: StoryObj = {
  render: () => (
    <XDSChart
      data={plData}
      xKey="month"
      yKeys={['profit']}
      yBaseline="zero"
      height={300}>
      <XDSChartGrid horizontal />
      <XDSChartAxis position="bottom" />
      <XDSChartAxis position="left" />
      <XDSChartBar dataKey="profit" color={colors[0]} />
    </XDSChart>
  ),
};

/** Gradient legend piped directly from XDSChartColors palettes. */
export const GradientLegend: StoryObj = {
  render: () => (
    <XDSChart
      data={[
        {x: 0, v: 0},
        {x: 1, v: 100},
      ]}
      xKey="x"
      yKeys={['v']}
      height={80}>
      <XDSChartLegend
        gradient={XDSChartColors.sequential.blue(5)}
        domain={[0, 100]}
        label="Temperature"
      />
    </XDSChart>
  ),
};
