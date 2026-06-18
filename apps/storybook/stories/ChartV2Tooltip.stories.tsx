// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {ChartV2 as Chart, bar, line} from '@xds/lab';
import {
  ChartV2Grid as ChartGrid,
  ChartV2Axis as ChartAxis,
  currency,
} from '@xds/lab';

const meta: Meta = {
  title: 'Lab/ChartV2Tooltip',
};
export default meta;

const monthlyData = [
  {month: 'Jan', revenue: 45, costs: 30, trend: 38},
  {month: 'Feb', revenue: 52, costs: 35, trend: 42},
  {month: 'Mar', revenue: 48, costs: 32, trend: 40},
  {month: 'Apr', revenue: 61, costs: 38, trend: 48},
  {month: 'May', revenue: 55, costs: 34, trend: 45},
  {month: 'Jun', revenue: 70, costs: 40, trend: 52},
];

const series = [
  bar('revenue', {color: '#3b82f6', label: 'Revenue'}),
  bar('costs', {color: '#ef4444', label: 'Costs'}),
  line('trend', {color: '#f59e0b', label: 'Trend'}),
];

/** Hover over the chart to see the grouped tooltip with all series values at the hovered x-position. */
export const Tooltip: StoryObj = {
  render: () => (
    <Chart
      data={monthlyData}
      xKey="month"
      series={series}
      tooltip
      grid={<ChartGrid />}
      axes={
        <>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" tickFormat={currency()} />
        </>
      }
      height={300}
    />
  ),
};
