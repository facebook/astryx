// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {CircularProgress} from '@xds/lab/CircularProgress';
import {Text} from '@xds/core/Text';

const meta: Meta<typeof CircularProgress> = {
  title: 'Lab/CircularProgress',
  component: CircularProgress,
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
type Story = StoryObj<typeof CircularProgress>;

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
      <CircularProgress value={60} size="sm" label="Small" />
      <CircularProgress value={60} size="md" label="Medium" />
      <CircularProgress value={60} size="lg" label="Large" />
    </div>
  ),
};

export const SizesWithLabels: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '24px', alignItems: 'center'}}>
      <CircularProgress value={60} size="sm" label="Small">
        <Text type="supporting" style={{fontSize: 8}}>
          60%
        </Text>
      </CircularProgress>
      <CircularProgress value={60} size="md" label="Medium">
        <Text type="supporting" style={{fontSize: 11}}>
          60%
        </Text>
      </CircularProgress>
      <CircularProgress value={60} size="lg" label="Large">
        <Text type="body">60%</Text>
      </CircularProgress>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '24px', alignItems: 'center'}}>
      <CircularProgress value={60} label="Accent" variant="accent" />
      <CircularProgress value={80} label="Positive" variant="success" />
      <CircularProgress value={50} label="Warning" variant="warning" />
      <CircularProgress value={92} label="Negative" variant="error" />
      <CircularProgress value={35} label="Neutral" variant="neutral" />
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
      <CircularProgress size="sm" label="Loading small" />
      <CircularProgress size="md" label="Loading medium" />
      <CircularProgress size="lg" label="Loading large" />
    </div>
  ),
};

export const IndeterminateVariants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '24px', alignItems: 'center'}}>
      <CircularProgress label="Accent" variant="accent" />
      <CircularProgress label="Positive" variant="success" />
      <CircularProgress label="Warning" variant="warning" />
      <CircularProgress label="Negative" variant="error" />
    </div>
  ),
};
