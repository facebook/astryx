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
    isLabelHidden: {
      control: 'boolean',
      description: 'Visually hide the label',
    },
    hasValueLabel: {
      control: 'boolean',
      description: 'Show formatted value',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Disabled state (grayed out)',
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
        value={80}
        label="Success"
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

export const Disabled: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '300px',
      }}>
      <XDSProgressBar
        value={30}
        label="Upload canceled"
        isDisabled
        hasValueLabel
      />
      <XDSProgressBar isIndeterminate label="Processing disabled" isDisabled />
    </div>
  ),
};

export const ComposedWithDescription: Story = {
  name: 'Composed: with description',
  render: () => (
    <div style={{width: '300px'}}>
      <XDSProgressBar
        value={40}
        max={100}
        label="Download progress"
        hasValueLabel
      />
      <div
        style={{
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
          marginTop: '4px',
        }}>
        40 MB / 100 MB downloaded
      </div>
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
