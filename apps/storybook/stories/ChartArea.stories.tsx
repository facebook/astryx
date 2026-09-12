// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGrid,
  type ChartAreaProps,
} from '@astryxdesign/lab';

const data = [
  {month: 'Jan', mean: 42, upper95: 52, lower95: 32},
  {month: 'Feb', mean: 38, upper95: 50, lower95: 26},
  {month: 'Mar', mean: 51, upper95: 62, lower95: 40},
  {month: 'Apr', mean: 46, upper95: 58, lower95: 34},
  {month: 'May', mean: 54, upper95: 66, lower95: 42},
  {month: 'Jun', mean: 62, upper95: 74, lower95: 50},
];

function ChartAreaFixture(args: ChartAreaProps) {
  const yKeys = [
    args.yUpper ?? args.baseline,
    args.yLower ?? args.baseline,
  ].filter((key): key is string => key != null);

  return (
    <Chart
      data={data}
      xKey="month"
      yKeys={yKeys}
      label="Monthly estimate with confidence interval">
      <ChartGrid horizontal />
      <ChartAxis position="bottom" />
      <ChartAxis position="left" />
      <ChartArea {...args} />
    </Chart>
  );
}

const meta: Meta<typeof ChartArea> = {
  title: 'Lab/ChartArea',
  component: ChartArea,
  tags: ['autodocs'],
  render: args => <ChartAreaFixture {...args} />,
  args: {
    yUpper: 'upper95',
    yLower: 'lower95',
    color: 'var(--color-data-categorical-blue)',
    opacity: 0.2,
    stroke: false,
    strokeWidth: 1,
  },
  argTypes: {
    color: {control: 'color'},
    opacity: {control: {type: 'range', min: 0, max: 1, step: 0.05}},
    stroke: {control: 'boolean'},
    strokeWidth: {control: {type: 'range', min: 0, max: 8, step: 0.5}},
  },
};

export default meta;
type Story = StoryObj<typeof ChartArea>;

export const Band: Story = {};

export const WithEdgeStroke: Story = {
  args: {
    stroke: true,
    strokeWidth: 2,
  },
};

export const UpperBoundAgainstBaseline: Story = {
  args: {
    yLower: undefined,
    baseline: 'mean',
    stroke: true,
  },
};
