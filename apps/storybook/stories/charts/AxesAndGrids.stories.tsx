// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {Chart, bar, ChartGrid, ChartAxis} from '@astryxdesign/charts';
import {monthlyData} from './_data';

interface Args {
  horizontalGrid: boolean;
  verticalGrid: boolean;
  bottomAxisLine: boolean;
  leftAxisLine: boolean;
  showTicks: boolean;
}

const meta: Meta<Args> = {
  title: 'Charts/Chrome/Axes & Grids',
  argTypes: {
    horizontalGrid: {control: 'boolean'},
    verticalGrid: {control: 'boolean'},
    bottomAxisLine: {control: 'boolean'},
    leftAxisLine: {control: 'boolean'},
    showTicks: {control: 'boolean'},
  },
  args: {
    horizontalGrid: true,
    verticalGrid: false,
    bottomAxisLine: true,
    leftAxisLine: false,
    showTicks: false,
  },
};
export default meta;

/** Toggle grid lines, axis edge lines, and tick marks independently. */
export const Playground: StoryObj<Args> = {
  render: args => (
    <Chart
      data={monthlyData}
      xKey="month"
      series={[bar('revenue', {color: '#3b82f6'})]}
      grid={
        <ChartGrid
          horizontal={args.horizontalGrid}
          vertical={args.verticalGrid}
        />
      }
      axes={
        <>
          <ChartAxis
            position="bottom"
            showAxisLine={args.bottomAxisLine}
            showTicks={args.showTicks}
          />
          <ChartAxis
            position="left"
            showAxisLine={args.leftAxisLine}
            showTicks={args.showTicks}
          />
        </>
      }
      height={300}
    />
  ),
};
