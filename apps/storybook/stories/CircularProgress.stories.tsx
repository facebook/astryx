// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {XDSCircularProgress} from '@xds/core/CircularProgress';
import {XDSText} from '@xds/core/Text';

const meta: Meta<typeof XDSCircularProgress> = {
  title: 'Core/CircularProgress',
  component: XDSCircularProgress,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: {type: 'range', min: 0, max: 100, step: 1},
      description: 'Current value',
    },
    max: {
      control: 'number',
      description: 'Maximum value',
    },
    label: {
      control: 'text',
      description: 'Accessible label',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Ring diameter',
    },
    variant: {
      control: 'select',
      options: ['accent', 'success', 'warning', 'error', 'neutral'],
      description: 'Semantic color variant',
    },
    isLabelHidden: {
      control: 'boolean',
      description: 'Visually hide the label',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSCircularProgress>;

export const Default: Story = {
  args: {
    value: 60,
    label: 'Progress',
  },
};

export const WithCenterLabel: Story = {
  args: {
    value: 75,
    label: 'Upload progress',
    size: 'lg',
    children: '75%',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '24px', alignItems: 'center'}}>
      <XDSCircularProgress value={60} size="sm" label="Small" />
      <XDSCircularProgress value={60} size="md" label="Medium" />
      <XDSCircularProgress value={60} size="lg" label="Large" />
    </div>
  ),
};

export const SizesWithLabels: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '24px', alignItems: 'center'}}>
      <XDSCircularProgress value={60} size="sm" label="Small">
        <XDSText type="supporting" style={{fontSize: 8}}>
          60%
        </XDSText>
      </XDSCircularProgress>
      <XDSCircularProgress value={60} size="md" label="Medium">
        <XDSText type="supporting" style={{fontSize: 11}}>
          60%
        </XDSText>
      </XDSCircularProgress>
      <XDSCircularProgress value={60} size="lg" label="Large">
        <XDSText type="body">60%</XDSText>
      </XDSCircularProgress>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '24px', alignItems: 'center'}}>
      <XDSCircularProgress value={60} label="Accent" variant="accent" />
      <XDSCircularProgress value={80} label="Positive" variant="success" />
      <XDSCircularProgress value={50} label="Warning" variant="warning" />
      <XDSCircularProgress value={92} label="Negative" variant="error" />
      <XDSCircularProgress value={35} label="Neutral" variant="neutral" />
    </div>
  ),
};

export const Empty: Story = {
  args: {
    value: 0,
    label: 'Not started',
  },
};

export const Full: Story = {
  args: {
    value: 100,
    label: 'Complete',
    variant: 'success',
    size: 'lg',
    children: '100%',
  },
};

export const Indeterminate: Story = {
  args: {
    label: 'Loading...',
  },
};

export const IndeterminateSizes: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '24px', alignItems: 'center'}}>
      <XDSCircularProgress size="sm" label="Loading small" />
      <XDSCircularProgress size="md" label="Loading medium" />
      <XDSCircularProgress size="lg" label="Loading large" />
    </div>
  ),
};

export const IndeterminateVariants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '24px', alignItems: 'center'}}>
      <XDSCircularProgress label="Accent" variant="accent" />
      <XDSCircularProgress label="Positive" variant="success" />
      <XDSCircularProgress label="Warning" variant="warning" />
      <XDSCircularProgress label="Negative" variant="error" />
    </div>
  ),
};
