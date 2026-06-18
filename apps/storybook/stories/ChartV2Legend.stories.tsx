// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {ChartV2Legend} from '@xds/lab';

const sampleItems = [
  {label: 'Revenue', color: '#3b82f6', type: 'bar'},
  {label: 'Costs', color: '#ef4444', type: 'bar'},
  {label: 'Trend', color: '#f59e0b', type: 'line'},
];

const meta: Meta<typeof ChartV2Legend> = {
  title: 'Lab/ChartV2Legend',
  component: ChartV2Legend,
  argTypes: {
    position: {
      control: 'inline-radio',
      options: ['top', 'bottom', 'start', 'end'],
    },
    alignment: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
    },
    items: {table: {disable: true}},
  },
  args: {
    items: sampleItems,
    alignment: 'start',
  },
  render: args => <ChartV2Legend {...args} />,
};
export default meta;

/** Standalone chart legend. Use the Controls panel to switch position and alignment. */
export const Legend: StoryObj = {
  args: {position: 'bottom'},
};
