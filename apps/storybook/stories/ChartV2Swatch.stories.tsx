// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {ChartSwatch} from '@astryxdesign/charts';

const meta: Meta<typeof ChartSwatch> = {
  title: 'Lab/ChartV2Swatch',
  component: ChartSwatch,
  argTypes: {
    color: {control: 'color'},
    variant: {
      control: 'inline-radio',
      options: ['square', 'line'],
    },
  },
  args: {
    color: '#3b82f6',
    variant: 'square',
  },
};
export default meta;

/** Color swatch primitive — square for bar series, line for line/dot/area and any other non-bar mark. */
export const Swatch: StoryObj = {};
