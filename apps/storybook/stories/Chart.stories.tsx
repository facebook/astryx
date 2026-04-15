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
  useXDSChartColors,
} from '@xds/lab';

/**
 * `XDSChart` is the root container for all chart components. It computes
 * scales from data and provides them to children via React context.
 *
 * Colors come from `useXDSChartColors()` — theme-aware, always resolved
 * for the current light/dark mode.
 *
 * ## Composition
 *
 * ```tsx
 * const colors = useXDSChartColors();
 * <XDSChart data={data} xKey="month" yKeys={['revenue']}>
 *   <XDSChartGrid horizontal />
 *   <XDSChartAxis position="bottom" />
 *   <XDSChartAxis position="left" />
 *   <XDSChartBar dataKey="revenue" color={colors.categorical(1)[0]} />
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

function BarChartDemo() {
  const colors = useXDSChartColors();
  return (
    <XDSChart data={monthlyData} xKey="month" yKeys={['revenue']} height={300}>
      <XDSChartGrid horizontal />
      <XDSChartAxis position="bottom" />
      <XDSChartAxis position="left" />
      <XDSChartBar dataKey="revenue" color={colors.categorical(1)[0]} />
      <XDSChartTooltip />
    </XDSChart>
  );
}

export const BarChart: StoryObj = {render: () => <BarChartDemo />};

function LineChartDemo() {
  const colors = useXDSChartColors();
  const c = colors.categorical(2);
  return (
    <XDSChart
      data={monthlyData}
      xKey="month"
      yKeys={['revenue', 'expenses']}
      height={300}>
      <XDSChartGrid horizontal />
      <XDSChartAxis position="bottom" />
      <XDSChartAxis position="left" />
      <XDSChartLine dataKey="revenue" color={c[0]} dots />
      <XDSChartLine dataKey="expenses" color={c[1]} dots />
      <XDSChartLegend
        items={[
          {label: 'Revenue', color: c[0]},
          {label: 'Expenses', color: c[1]},
        ]}
      />
      <XDSChartTooltip />
    </XDSChart>
  );
}

export const LineChart: StoryObj = {render: () => <LineChartDemo />};

function MixedChartDemo() {
  const colors = useXDSChartColors();
  const c = colors.categorical(3);
  return (
    <XDSChart
      data={monthlyData}
      xKey="month"
      yKeys={['revenue', 'trend']}
      height={300}>
      <XDSChartGrid horizontal />
      <XDSChartAxis position="bottom" />
      <XDSChartAxis position="left" />
      <XDSChartBar dataKey="revenue" color={c[0]} />
      <XDSChartLine dataKey="trend" color={c[2]} dots />
      <XDSChartLegend
        items={[
          {label: 'Revenue', color: c[0]},
          {label: 'Trend', color: c[2]},
        ]}
      />
      <XDSChartTooltip />
    </XDSChart>
  );
}

export const MixedChart: StoryObj = {render: () => <MixedChartDemo />};

function ScatterPlotDemo() {
  const colors = useXDSChartColors();
  const c = colors.categorical(2);
  return (
    <XDSChart
      data={monthlyData}
      xKey="month"
      yKeys={['revenue', 'expenses']}
      height={300}>
      <XDSChartGrid horizontal vertical />
      <XDSChartAxis position="bottom" />
      <XDSChartAxis position="left" />
      <XDSChartDot dataKey="revenue" color={c[0]} radius={5} />
      <XDSChartDot dataKey="expenses" color={c[1]} radius={5} />
      <XDSChartLegend
        items={[
          {label: 'Revenue', color: c[0]},
          {label: 'Expenses', color: c[1]},
        ]}
      />
      <XDSChartTooltip />
    </XDSChart>
  );
}

export const ScatterPlot: StoryObj = {render: () => <ScatterPlotDemo />};

const ciData = [
  {month: 'Jan', mean: 42, upper95: 52, lower95: 32},
  {month: 'Feb', mean: 38, upper95: 50, lower95: 26},
  {month: 'Mar', mean: 51, upper95: 62, lower95: 40},
  {month: 'Apr', mean: 46, upper95: 58, lower95: 34},
  {month: 'May', mean: 54, upper95: 66, lower95: 42},
  {month: 'Jun', mean: 62, upper95: 74, lower95: 50},
];

function ConfidenceBandDemo() {
  const colors = useXDSChartColors();
  const c = colors.categorical(1);
  return (
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
        color={c[0]}
        opacity={0.15}
      />
      <XDSChartLine dataKey="mean" color={c[0]} dots />
      <XDSChartTooltip />
    </XDSChart>
  );
}

export const ConfidenceBand: StoryObj = {render: () => <ConfidenceBandDemo />};

const errorData = [
  {cat: 'A', value: 45, upper: 52, lower: 38},
  {cat: 'B', value: 62, upper: 70, lower: 54},
  {cat: 'C', value: 38, upper: 48, lower: 28},
  {cat: 'D', value: 55, upper: 60, lower: 50},
];

function ErrorBarDemo() {
  const colors = useXDSChartColors();
  return (
    <XDSChart
      data={errorData}
      xKey="cat"
      yKeys={['upper', 'lower']}
      height={300}>
      <XDSChartGrid horizontal />
      <XDSChartAxis position="bottom" />
      <XDSChartAxis position="left" />
      <XDSChartBar dataKey="value" color={colors.categorical(1)[0]} />
      <XDSChartErrorBar yUpper="upper" yLower="lower" />
    </XDSChart>
  );
}

export const WithErrorBars: StoryObj = {render: () => <ErrorBarDemo />};

const ohlcData = [
  {day: 'Mon', open: 100, close: 108, high: 112, low: 98},
  {day: 'Tue', open: 108, close: 103, high: 110, low: 101},
  {day: 'Wed', open: 103, close: 110, high: 115, low: 100},
  {day: 'Thu', open: 110, close: 106, high: 113, low: 104},
  {day: 'Fri', open: 106, close: 114, high: 118, low: 105},
];

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

function CandlestickBarDemo() {
  const colors = useXDSChartColors();
  return (
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
        color={colors.categorical(1)[0]}
      />
    </XDSChart>
  );
}

export const CandlestickBar: StoryObj = {render: () => <CandlestickBarDemo />};

const plData = [
  {month: 'Jan', profit: 12},
  {month: 'Feb', profit: -8},
  {month: 'Mar', profit: 22},
  {month: 'Apr', profit: -15},
  {month: 'May', profit: 5},
  {month: 'Jun', profit: -3},
];

function ZeroCenteredDemo() {
  const colors = useXDSChartColors();
  return (
    <XDSChart
      data={plData}
      xKey="month"
      yKeys={['profit']}
      yBaseline="zero"
      height={300}>
      <XDSChartGrid horizontal />
      <XDSChartAxis position="bottom" />
      <XDSChartAxis position="left" />
      <XDSChartBar dataKey="profit" color={colors.categorical(1)[0]} />
    </XDSChart>
  );
}

export const ZeroCentered: StoryObj = {render: () => <ZeroCenteredDemo />};

function GradientLegendDemo() {
  const colors = useXDSChartColors();
  return (
    <XDSChart
      data={[
        {x: 0, v: 0},
        {x: 1, v: 100},
      ]}
      xKey="x"
      yKeys={['v']}
      height={80}>
      <XDSChartLegend
        gradient={colors.sequential.blue(5)}
        domain={[0, 100]}
        label="Temperature"
      />
    </XDSChart>
  );
}

export const GradientLegend: StoryObj = {render: () => <GradientLegendDemo />};
