// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {
  Chart,
  bar,
  line,
  band,
  errorBar,
  referenceLine,
  ChartGrid,
  ChartAxis,
} from '@astryxdesign/charts';
import {monthlyData, salesData} from './_data';

const meta: Meta<typeof Chart> = {
  title: 'Charts/Composite',
  component: Chart,
};
export default meta;

const axes = (
  <>
    <ChartAxis position="bottom" />
    <ChartAxis position="left" />
  </>
);

/** Bars + a trendline overlay sharing one scale. */
export const MixedMarks: StoryObj = {
  render: () => (
    <Chart
      data={monthlyData}
      xKey="month"
      title="Revenue vs trend"
      subtitle="Bars with a trendline overlay"
      series={[
        bar('revenue', {color: '#3b82f6', label: 'Revenue'}),
        line('trend', {color: '#f59e0b', label: 'Trend'}),
      ]}
      tooltip
      legend
      grid={<ChartGrid />}
      axes={axes}
      height={320}
    />
  ),
};

/** Many marks at once: reference band + line, confidence band, bars, error bars, line. */
export const KitchenSink: StoryObj = {
  render: () => {
    const data = salesData.map((d, i, arr) => {
      const avg =
        arr.slice(0, i + 1).reduce((s, v) => s + v.sales, 0) / (i + 1);
      return {
        ...d,
        runAvg: Math.round(avg * 10) / 10,
        upper: Math.round((avg + 8) * 10) / 10,
        lower: Math.round((avg - 8) * 10) / 10,
      };
    });
    return (
      <Chart
        data={data}
        xKey="month"
        title="Kitchen sink"
        series={[
          referenceLine({y: 40, y2: 60, color: '#22c55e', bandOpacity: 0.08}),
          referenceLine({y: 50, label: 'Target', color: '#ef4444'}),
          band({
            upper: 'upper',
            lower: 'lower',
            color: '#f59e0b',
            opacity: 0.15,
          }),
          bar('sales', {color: '#3b82f6', label: 'Sales'}),
          errorBar({high: 'errorHigh', low: 'errorLow', color: '#1e3a5f'}),
          line('runAvg', {color: '#f59e0b', strokeWidth: 2, label: 'Run avg'}),
        ]}
        grid={<ChartGrid />}
        axes={axes}
        height={400}
      />
    );
  },
};
