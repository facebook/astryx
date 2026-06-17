// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {ChartV2Swatch} from '@xds/lab';

const meta: Meta<typeof ChartV2Swatch> = {
  title: 'Lab/ChartV2Swatch',
  component: ChartV2Swatch,
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
