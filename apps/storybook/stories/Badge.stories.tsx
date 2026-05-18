// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {XDSBadge} from '@xds/core/Badge';

const meta: Meta<typeof XDSBadge> = {
  title: 'Core/Badge',
  component: XDSBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'neutral',
        'info',
        'success',
        'warning',
        'error',
        'blue',
        'cyan',
        'green',
        'orange',
        'pink',
        'purple',
        'red',
        'teal',
        'yellow',
      ],
      description: 'Visual style variant',
    },
    label: {
      control: 'text',
      description: 'Badge label text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSBadge>;

export const Default: Story = {
  args: {
    label: 'Badge',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <XDSBadge variant="neutral" label="Neutral" />
      <XDSBadge variant="info" label="Info" />
      <XDSBadge variant="success" label="Success" />
      <XDSBadge variant="warning" label="Warning" />
      <XDSBadge variant="error" label="Error" />
    </div>
  ),
};

export const Counts: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <XDSBadge variant="info" label={3} />
      <XDSBadge variant="error" label="99+" />
      <XDSBadge variant="success" label={12} />
    </div>
  ),
};

export const StatusLabels: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <XDSBadge variant="success" label="Active" />
      <XDSBadge variant="warning" label="Pending" />
      <XDSBadge variant="error" label="Failed" />
      <XDSBadge variant="neutral" label="Draft" />
    </div>
  ),
};

export const NonSemanticColors: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
      <XDSBadge variant="blue" label="Design" />
      <XDSBadge variant="cyan" label="DevOps" />
      <XDSBadge variant="green" label="Backend" />
      <XDSBadge variant="orange" label="Urgent" />
      <XDSBadge variant="pink" label="Marketing" />
      <XDSBadge variant="purple" label="Engineering" />
      <XDSBadge variant="red" label="Critical" />
      <XDSBadge variant="teal" label="Research" />
      <XDSBadge variant="yellow" label="Review" />
    </div>
  ),
};
