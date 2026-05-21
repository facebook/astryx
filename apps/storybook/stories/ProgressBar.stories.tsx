// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {XDSProgressBar} from '@xds/core/ProgressBar';

const meta: Meta<typeof XDSProgressBar> = {
  title: 'Core/ProgressBar',
  component: XDSProgressBar,
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
    variant: {
      control: 'select',
      options: ['accent', 'success', 'warning', 'error', 'neutral'],
      description: 'Semantic color variant',
    },
    status: {
      control: 'select',
      options: ['active', 'paused', 'canceled'],
      description: 'Semantic status state',
    },
    isLabelHidden: {
      control: 'boolean',
      description: 'Visually hide the label',
    },
    hasValueLabel: {
      control: 'boolean',
      description: 'Show formatted value',
    },
    description: {
      control: 'text',
      description: 'Secondary description below bar',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSProgressBar>;

export const Default: Story = {
  args: {
    value: 60,
    label: 'Progress',
  },
};

export const WithValueLabel: Story = {
  args: {
    value: 75,
    label: 'Storage used',
    hasValueLabel: true,
  },
};

export const CustomFormat: Story = {
  args: {
    value: 3.2,
    max: 5,
    label: 'Disk usage',
    hasValueLabel: true,
    formatValueLabel: (value: number, max: number) => `${value} GB / ${max} GB`,
  },
};

export const Variants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '300px',
      }}>
      <XDSProgressBar
        value={60}
        label="Accent"
        variant="accent"
        hasValueLabel
      />
      <XDSProgressBar
        value={100}
        label="Success (complete)"
        variant="success"
        hasValueLabel
      />
      <XDSProgressBar
        value={50}
        label="Warning"
        variant="warning"
        hasValueLabel
      />
      <XDSProgressBar value={92} label="Error" variant="error" hasValueLabel />
      <XDSProgressBar
        value={35}
        label="Neutral"
        variant="neutral"
        hasValueLabel
      />
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div style={{width: '300px'}}>
      <XDSProgressBar
        value={40}
        max={100}
        label="Download progress"
        hasValueLabel
        description="40 MB / 100 MB downloaded"
      />
    </div>
  ),
};

export const StatusPaused: Story = {
  name: 'Status: Paused',
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '300px',
      }}>
      <XDSProgressBar
        value={45}
        label="Upload paused"
        status="paused"
        hasValueLabel
        description="Paused — tap to resume"
      />
      <XDSProgressBar
        isIndeterminate
        label="Processing paused"
        status="paused"
      />
    </div>
  ),
};

export const StatusCanceled: Story = {
  name: 'Status: Canceled',
  render: () => (
    <div style={{width: '300px'}}>
      <XDSProgressBar
        value={30}
        label="Upload canceled"
        status="canceled"
        hasValueLabel
        description="Upload was canceled"
      />
    </div>
  ),
};

export const StatusIcons: Story = {
  name: 'Status Icons',
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '300px',
      }}>
      <XDSProgressBar
        value={100}
        label="Complete"
        variant="success"
        hasValueLabel
      />
      <XDSProgressBar
        value={80}
        label="Disk almost full"
        variant="warning"
        hasValueLabel
      />
      <XDSProgressBar
        value={95}
        label="Upload failed"
        variant="error"
        hasValueLabel
      />
      <XDSProgressBar value={45} label="Paused" status="paused" hasValueLabel />
      <XDSProgressBar
        value={30}
        label="Canceled"
        status="canceled"
        hasValueLabel
      />
    </div>
  ),
};

export const HiddenLabel: Story = {
  args: {
    value: 50,
    label: 'Loading progress',
    isLabelHidden: true,
  },
};

export const HiddenLabelWithValue: Story = {
  args: {
    value: 75,
    label: 'Upload',
    isLabelHidden: true,
    hasValueLabel: true,
  },
};

export const Empty: Story = {
  args: {
    value: 0,
    label: 'Not started',
    hasValueLabel: true,
  },
};

export const Full: Story = {
  args: {
    value: 100,
    label: 'Complete',
    hasValueLabel: true,
    variant: 'success',
  },
};

export const Indeterminate: Story = {
  args: {
    isIndeterminate: true,
    label: 'Loading...',
  },
};

export const IndeterminateHiddenLabel: Story = {
  args: {
    isIndeterminate: true,
    label: 'Loading',
    isLabelHidden: true,
  },
};

export const IndeterminateVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '300px',
      }}>
      <XDSProgressBar isIndeterminate label="Accent" variant="accent" />
      <XDSProgressBar isIndeterminate label="Success" variant="success" />
      <XDSProgressBar isIndeterminate label="Warning" variant="warning" />
      <XDSProgressBar isIndeterminate label="Error" variant="error" />
      <XDSProgressBar isIndeterminate label="Neutral" variant="neutral" />
    </div>
  ),
};
