import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSChart,
  XDSChartAxis,
  XDSChartGrid,
  XDSChartBar,
  XDSChartLine,
  XDSChartArea,
  XDSChartErrorBar,
  XDSChartCandlestick,
  XDSChartLegend,
  XDSChartColors,
} from '@xds/lab';
import {XDSStack, XDSText} from '@xds/core';
import {XDSHeading} from '@xds/core/Text';

const meta: Meta = {
  title: 'Lab/XDSChartAdvanced',
};

export default meta;

const colors = XDSChartColors.categorical(3);

// --- Confidence interval data ---
const ciData = [
  {month: 'Jan', mean: 42, upper95: 52, lower95: 32, upper80: 48, lower80: 36},
  {month: 'Feb', mean: 38, upper95: 50, lower95: 26, upper80: 44, lower80: 32},
  {month: 'Mar', mean: 51, upper95: 62, lower95: 40, upper80: 57, lower80: 45},
  {month: 'Apr', mean: 46, upper95: 58, lower95: 34, upper80: 52, lower80: 40},
  {month: 'May', mean: 54, upper95: 66, lower95: 42, upper80: 60, lower80: 48},
  {month: 'Jun', mean: 62, upper95: 74, lower95: 50, upper80: 68, lower80: 56},
];

/** Line chart with 95% and 80% confidence bands */
export const ConfidenceIntervals: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>Confidence Intervals</XDSHeading>
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
          opacity={0.1}
        />
        <XDSChartArea
          yUpper="upper80"
          yLower="lower80"
          color={colors[0]}
          opacity={0.2}
        />
        <XDSChartLine dataKey="mean" color={colors[0]} dots />
        <XDSChartLegend
          items={[
            {label: 'Mean', color: colors[0]},
            {label: '80% CI', color: XDSChartColors.alpha(colors[0], 0.3)},
            {label: '95% CI', color: XDSChartColors.alpha(colors[0], 0.15)},
          ]}
        />
      </XDSChart>
    </XDSStack>
  ),
};

/** Upper-only confidence band */
export const UpperConfidence: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>Upper Confidence Only</XDSHeading>
      <XDSChart
        data={ciData}
        xKey="month"
        yKeys={['upper95', 'mean']}
        height={300}>
        <XDSChartGrid horizontal />
        <XDSChartAxis position="bottom" />
        <XDSChartAxis position="left" />
        <XDSChartArea
          yUpper="upper95"
          baseline="mean"
          color={colors[1]}
          opacity={0.2}
        />
        <XDSChartLine dataKey="mean" color={colors[1]} dots />
      </XDSChart>
    </XDSStack>
  ),
};

// --- Error bar data ---
const errorData = [
  {category: 'A', value: 45, upper: 52, lower: 38},
  {category: 'B', value: 62, upper: 70, lower: 54},
  {category: 'C', value: 38, upper: 48, lower: 28},
  {category: 'D', value: 55, upper: 60, lower: 50},
  {category: 'E', value: 48, upper: 58, lower: 38},
];

/** Bar chart with error bars */
export const ErrorBars: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>Bar Chart with Error Bars</XDSHeading>
      <XDSChart
        data={errorData}
        xKey="category"
        yKeys={['upper', 'lower']}
        height={300}>
        <XDSChartGrid horizontal />
        <XDSChartAxis position="bottom" />
        <XDSChartAxis position="left" />
        <XDSChartBar dataKey="value" color={colors[0]} />
        <XDSChartErrorBar yUpper="upper" yLower="lower" />
      </XDSChart>
    </XDSStack>
  ),
};

// --- Candlestick data ---
const ohlcData = [
  {day: 'Mon', open: 100, close: 108, high: 112, low: 98},
  {day: 'Tue', open: 108, close: 103, high: 110, low: 101},
  {day: 'Wed', open: 103, close: 110, high: 115, low: 100},
  {day: 'Thu', open: 110, close: 106, high: 113, low: 104},
  {day: 'Fri', open: 106, close: 114, high: 118, low: 105},
];

/** Traditional candlestick chart */
export const Candlestick: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>Candlestick (OHLC)</XDSHeading>
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
    </XDSStack>
  ),
};

/** OHLC bar variant */
export const CandlestickBar: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>OHLC Bar</XDSHeading>
      <XDSText type="supporting" color="secondary">
        Line, gap, dot, gap, line. Vertical line for range, left tick at open,
        right tick at close.
      </XDSText>
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
    </XDSStack>
  ),
};

// --- Positive/negative data ---
const plData = [
  {month: 'Jan', profit: 12},
  {month: 'Feb', profit: -8},
  {month: 'Mar', profit: 22},
  {month: 'Apr', profit: -15},
  {month: 'May', profit: 5},
  {month: 'Jun', profit: -3},
];

/** Zero-centered bar chart for positive/negative data */
export const ZeroCentered: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>
        Zero-Centered (yBaseline=&quot;zero&quot;)
      </XDSHeading>
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
    </XDSStack>
  ),
};

/** Gradient legend piped from XDSChartColors */
export const GradientLegend: StoryObj = {
  render: () => (
    <XDSStack direction="vertical" gap={6}>
      <XDSHeading level={3}>Gradient Legends</XDSHeading>
      <XDSStack direction="vertical" gap={4}>
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
        <XDSChart
          data={[
            {x: 0, v: -50},
            {x: 1, v: 50},
          ]}
          xKey="x"
          yKeys={['v']}
          height={80}>
          <XDSChartLegend
            gradient={XDSChartColors.diverging.coldHot(7)}
            domain={[-50, 50]}
            label="Change %"
            tickFormat={v => `${v > 0 ? '+' : ''}${v}%`}
          />
        </XDSChart>
        <XDSChart
          data={[
            {x: 0, v: 0},
            {x: 1, v: 1},
          ]}
          xKey="x"
          yKeys={['v']}
          height={80}>
          <XDSChartLegend
            gradient={XDSChartColors.diverging.positiveNegative(9)}
            domain={[-100, 100]}
            label="Profit/Loss"
            ticks={5}
          />
        </XDSChart>
      </XDSStack>
    </XDSStack>
  ),
};
