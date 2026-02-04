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
      <XDSBadge variant="neutral">Neutral</XDSBadge>
      <XDSBadge variant="info">Info</XDSBadge>
      <XDSBadge variant="success">Success</XDSBadge>
      <XDSBadge variant="warning">Warning</XDSBadge>
      <XDSBadge variant="error">Error</XDSBadge>
    </div>
  ),
};

export const Counts: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <XDSBadge variant="info">3</XDSBadge>
      <XDSBadge variant="error">99+</XDSBadge>
      <XDSBadge variant="success">12</XDSBadge>
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
      <XDSBadge variant="success">Active</XDSBadge>
      <XDSBadge variant="warning">Pending</XDSBadge>
      <XDSBadge variant="error">Failed</XDSBadge>
      <XDSBadge variant="neutral">Draft</XDSBadge>
    </div>
  ),
};
