import type {Meta, StoryObj} from '@storybook/react';
import {XDSMeter} from '@xds/core/Meter';

const meta: Meta<typeof XDSMeter> = {
  title: 'Core/XDSMeter',
  component: XDSMeter,
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
      options: ['accent', 'positive', 'warning', 'negative'],
      description: 'Semantic color variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Track height',
    },
    isLabelHidden: {
      control: 'boolean',
      description: 'Visually hide the label',
    },
    hasValueLabel: {
      control: 'boolean',
      description: 'Show formatted value',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSMeter>;

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
      <XDSMeter value={60} label="Accent" variant="accent" hasValueLabel />
      <XDSMeter value={80} label="Positive" variant="positive" hasValueLabel />
      <XDSMeter value={50} label="Warning" variant="warning" hasValueLabel />
      <XDSMeter value={92} label="Negative" variant="negative" hasValueLabel />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '300px',
      }}>
      <XDSMeter value={60} label="Small" size="sm" hasValueLabel />
      <XDSMeter value={60} label="Medium" size="md" hasValueLabel />
      <XDSMeter value={60} label="Large" size="lg" hasValueLabel />
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
    variant: 'positive',
  },
};
