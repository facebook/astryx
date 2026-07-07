// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {Chart, bar, line, ChartGrid, ChartAxis} from '@astryxdesign/charts';
import {monthlyData, profitLossData} from './_data';

const meta: Meta<typeof Chart> = {
  title: 'Charts/Color',
  component: Chart,
};
export default meta;

const axes = (
  <>
    <ChartAxis position="bottom" />
    <ChartAxis position="left" />
  </>
);

/** No colors passed — the chart assigns distinct colors from the theme palette. */
export const AutoPalette: StoryObj = {
  render: () => (
    <Chart
      data={monthlyData}
      xKey="month"
      title="Auto palette"
      subtitle="No colors passed — assigned from the theme's categorical palette"
      series={[
        bar('revenue', {group: 'g'}),
        bar('costs', {group: 'g'}),
        line('trend'),
      ]}
      legend
      grid={<ChartGrid />}
      axes={axes}
      height={320}
    />
  ),
};

/** Per-datum color via an accessor; the series still shows in the legend. */
export const AccessorColor: StoryObj = {
  render: () => (
    <Chart
      data={profitLossData}
      xKey="month"
      title="Green when positive, red when negative"
      series={[
        bar('profit', {
          label: 'Profit',
          color: d =>
            (d.profit as number) >= 0
              ? 'var(--color-success)'
              : 'var(--color-error)',
        }),
      ]}
      legend
      grid={<ChartGrid />}
      axes={axes}
      height={320}
    />
  ),
};
