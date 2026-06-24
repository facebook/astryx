// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {StatusDot} from '@astryxdesign/core/StatusDot';

const meta: Meta<typeof StatusDot> = {
  title: 'Core/StatusDot',
  component: StatusDot,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'warning', 'error', 'accent', 'neutral'],
      description: 'Semantic color variant',
    },
    label: {
      control: 'text',
      description: 'Accessible label',
    },
    isPulsing: {
      control: 'boolean',
      description: 'Pulse animation',
    },
    tooltip: {
      control: 'text',
      description: 'Tooltip text on hover',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusDot>;

export const Default: Story = {
  args: {
    variant: 'success',
    label: 'Online',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <StatusDot variant="success" label="Positive" />
      <StatusDot variant="warning" label="Warning" />
      <StatusDot variant="error" label="Negative" />
      <StatusDot variant="accent" label="Info" />
      <StatusDot variant="neutral" label="Neutral" />
    </div>
  ),
};

export const Pulsing: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <StatusDot variant="success" label="Live" isPulsing />
      <StatusDot variant="warning" label="Processing" isPulsing />
      <StatusDot variant="error" label="Error" isPulsing />
    </div>
  ),
};

export const StatusIndicators: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <StatusDot variant="success" label="Online" />
        <span>Online</span>
      </div>
      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <StatusDot variant="warning" label="Away" />
        <span>Away</span>
      </div>
      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <StatusDot variant="error" label="Offline" />
        <span>Offline</span>
      </div>
      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <StatusDot variant="neutral" label="Unknown" />
        <span>Unknown</span>
      </div>
    </div>
  ),
};

export const WithTooltip: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
      <StatusDot variant="success" label="Online" tooltip="Online" />
      <StatusDot variant="warning" label="Away" tooltip="Away" />
      <StatusDot variant="error" label="Offline" tooltip="Offline" />
      <StatusDot variant="neutral" label="Unknown" tooltip="Unknown" />
    </div>
  ),
};
