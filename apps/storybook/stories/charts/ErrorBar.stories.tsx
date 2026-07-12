// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {Chart, bar, errorBar, ChartGrid, ChartAxis} from '@astryxdesign/charts';
import {salesData} from './_data';

const meta: Meta<typeof Chart> = {
  title: 'Charts/Error Bar',
  component: Chart,
};
export default meta;

/** Error bars pair with a value mark (here, bars) to show a high/low range. */
export const OnBars: StoryObj = {
  render: () => (
    <Chart
      data={salesData}
      xKey="month"
      title="Sales with error bars"
      series={[
        bar('sales', {color: '#3b82f6'}),
        errorBar({high: 'errorHigh', low: 'errorLow', color: '#1e3a5f'}),
      ]}
      grid={<ChartGrid />}
      axes={
        <>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>
      }
      height={320}
    />
  ),
};
