// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {XDSStatusDot} from '@xds/core/StatusDot';

const meta: Meta<typeof XDSStatusDot> = {
  title: 'Core/StatusDot',
  component: XDSStatusDot,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'warning', 'error', 'accent', 'neutral'],
      description: 'Semantic color variant',
    },
    size: {
      table: {disable: true},
    },
    label: {
      control: 'text',
      description: 'Accessible label',
    },
    isPulsing: {
      control: 'boolean',
      description: 'Pulse animation',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSStatusDot>;

export const Default: Story = {
  args: {
    variant: 'success',
    label: 'Online',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <XDSStatusDot variant="success" label="Positive" />
      <XDSStatusDot variant="warning" label="Warning" />
      <XDSStatusDot variant="error" label="Negative" />
      <XDSStatusDot variant="accent" label="Info" />
      <XDSStatusDot variant="neutral" label="Neutral" />
    </div>
  ),
};

export const Pulsing: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <XDSStatusDot variant="success" label="Live" isPulsing />
      <XDSStatusDot variant="warning" label="Processing" isPulsing />
      <XDSStatusDot variant="error" label="Error" isPulsing />
    </div>
  ),
};

export const StatusIndicators: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <XDSStatusDot variant="success" label="Online" />
        <span>Online</span>
      </div>
      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <XDSStatusDot variant="warning" label="Away" />
        <span>Away</span>
      </div>
      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <XDSStatusDot variant="error" label="Offline" />
        <span>Offline</span>
      </div>
      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <XDSStatusDot variant="neutral" label="Unknown" />
        <span>Unknown</span>
      </div>
    </div>
  ),
};
