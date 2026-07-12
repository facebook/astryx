// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {
  Chart,
  bar,
  line,
  referenceLine,
  ChartGrid,
  ChartAxis,
} from '@astryxdesign/charts';
import {salesData, predictionData} from './_data';

const meta: Meta<typeof Chart> = {
  title: 'Charts/Reference Line',
  component: Chart,
};
export default meta;

const axes = (
  <>
    <ChartAxis position="bottom" />
    <ChartAxis position="left" />
  </>
);

/** A single horizontal reference line at a fixed y value. */
export const Horizontal: StoryObj = {
  render: () => (
    <Chart
      data={salesData}
      xKey="month"
      title="Sales vs target"
      series={[
        bar('sales', {color: '#3b82f6'}),
        referenceLine({y: 50, label: 'Target', color: '#ef4444'}),
      ]}
      grid={<ChartGrid />}
      axes={axes}
      height={300}
    />
  ),
};

/** A shaded band between two y values (y + y2). */
export const Band: StoryObj = {
  render: () => (
    <Chart
      data={salesData}
      xKey="month"
      title="Acceptable range"
      series={[
        bar('sales', {color: '#3b82f6'}),
        referenceLine({
          y: 40,
          y2: 60,
          label: 'Acceptable',
          color: '#22c55e',
          bandOpacity: 0.12,
        }),
      ]}
      grid={<ChartGrid />}
      axes={axes}
      height={300}
    />
  ),
};

/** A vertical reference line at a fixed x value (linear x scale only). */
export const Vertical: StoryObj = {
  render: () => (
    <Chart
      data={predictionData}
      xKey="x"
      title="Event marker"
      series={[
        line('mean', {color: '#3b82f6'}),
        referenceLine({x: 10, label: 'Launch', color: '#6b1efd'}),
      ]}
      grid={<ChartGrid />}
      axes={axes}
      height={300}
    />
  ),
};
