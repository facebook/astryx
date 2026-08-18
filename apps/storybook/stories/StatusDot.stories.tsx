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

/**
 * A simple custom mark, painted from `currentColor` so it inherits the dot's
 * ink and stays legible on the variant plate.
 */
function DiamondIcon() {
  return (
    <svg viewBox="0 0 8 8" width={8} height={8} aria-hidden="true">
      <rect
        x={2.4}
        y={2.4}
        width={3.2}
        height={3.2}
        fill="currentColor"
        transform="rotate(45 4 4)"
      />
    </svg>
  );
}

/**
 * The `icon` prop gives the status a non-colour mark. The dot itself is a
 * colour-only signal by default, so when a dot must stand on its own without
 * adjacent text, pass a different icon per status (see the usage guidance in
 * the component docs).
 */
export const WithIcon: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A custom `icon` rendered centered in the dot, painted from `currentColor`. Use a different icon per status so meaning does not rely on colour alone.',
      },
    },
  },
  render: () => (
    <div style={{display: 'flex', gap: '24px', alignItems: 'center'}}>
      <StatusDot variant="success" label="Verified" icon={<DiamondIcon />} />
      <StatusDot variant="accent" label="Featured" icon={<DiamondIcon />} />
      <span style={{fontSize: '11px'}}>icon carries the status as a shape</span>
    </div>
  ),
};
