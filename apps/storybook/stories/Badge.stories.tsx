// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {Badge} from '@xds/core/Badge';

const meta: Meta<typeof Badge> = {
  title: 'Core/Badge',
  component: Badge,
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
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    label: 'Badge',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <Badge variant="neutral" label="Neutral" />
      <Badge variant="info" label="Info" />
      <Badge variant="success" label="Success" />
      <Badge variant="warning" label="Warning" />
      <Badge variant="error" label="Error" />
    </div>
  ),
};

export const Counts: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <Badge variant="info" label={3} />
      <Badge variant="error" label="99+" />
      <Badge variant="success" label={12} />
    </div>
  ),
};

export const StatusLabels: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <Badge variant="success" label="Active" />
      <Badge variant="warning" label="Pending" />
      <Badge variant="error" label="Failed" />
      <Badge variant="neutral" label="Draft" />
    </div>
  ),
};

export const NonSemanticColors: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
      <Badge variant="blue" label="Design" />
      <Badge variant="cyan" label="DevOps" />
      <Badge variant="green" label="Backend" />
      <Badge variant="orange" label="Urgent" />
      <Badge variant="pink" label="Marketing" />
      <Badge variant="purple" label="Engineering" />
      <Badge variant="red" label="Critical" />
      <Badge variant="teal" label="Research" />
      <Badge variant="yellow" label="Review" />
    </div>
  ),
};
