import type {Meta, StoryObj} from '@storybook/react';
import {XDSBadge} from '@xds/core/Badge';

const meta: Meta<typeof XDSBadge> = {
  title: 'Core/XDSBadge',
  component: XDSBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'info', 'success', 'warning', 'error'],
      description: 'Visual style variant',
    },
    children: {
      control: 'text',
      description: 'Badge content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSBadge>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <XDSBadge variant="neutral" label='Neutral' />
      <XDSBadge variant="info" label='Info' />
      <XDSBadge variant="success" label='Success' />
      <XDSBadge variant="warning" label='Warning' />
      <XDSBadge variant="error" label='Error' />
    </div>
  ),
};

export const Counts: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <XDSBadge variant="info" label={3} />
      <XDSBadge variant="error" label='99+' />
      <XDSBadge variant="success" label={12} />
    </div>
  ),
};

export const DotIndicators: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <XDSBadge variant="neutral" />
      <XDSBadge variant="info" />
      <XDSBadge variant="success" />
      <XDSBadge variant="warning" />
      <XDSBadge variant="error" />
    </div>
  ),
};

export const StatusLabels: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <XDSBadge variant="success" label='Active' />
      <XDSBadge variant="warning" label='Pending' />
      <XDSBadge variant="error" label='Failed' />
      <XDSBadge variant="neutral" label='Draft' />
    </div>
  ),
};
