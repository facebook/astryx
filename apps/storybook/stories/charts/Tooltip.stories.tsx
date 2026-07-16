// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {
  Chart,
  bar,
  line,
  ChartGrid,
  ChartAxis,
  currency,
} from '@astryxdesign/charts';
import {monthlyData} from './_data';

const meta: Meta<typeof Chart> = {
  title: 'Charts/Chrome/Tooltip',
  component: Chart,
};
export default meta;

/** Hover the chart: a grouped tooltip shows every series value at that x, with a
 *  column highlight for bars and hover dots on lines. */
export const Default: StoryObj = {
  render: () => (
    <Chart
      data={monthlyData}
      xKey="month"
      series={[
        bar('revenue', {color: '#3b82f6', label: 'Revenue', stack: 'x'}),
        bar('costs', {color: '#ef4444', label: 'Costs', stack: 'x'}),
        line('trend', {color: '#f59e0b', label: 'Trend'}),
      ]}
      tooltip
      grid={<ChartGrid />}
      axes={
        <>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" tickFormat={currency()} />
        </>
      }
      height={320}
    />
  ),
};
