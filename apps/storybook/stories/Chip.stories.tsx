import type {Meta, StoryObj} from '@storybook/react';
import {XDSChip} from '@xds/core/Chip';

const meta: Meta<typeof XDSChip> = {
  title: 'Core/XDSChip',
  component: XDSChip,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'info', 'success', 'error'],
      description: 'Visual style variant',
    },
    children: {
      control: 'text',
      description: 'Chip content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSChip>;

export const Default: Story = {
  args: {
    children: 'Chip',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <XDSChip variant="neutral">Neutral</XDSChip>
      <XDSChip variant="info">Info</XDSChip>
      <XDSChip variant="success">Success</XDSChip>
      <XDSChip variant="error">Error</XDSChip>
    </div>
  ),
};

export const Dismissible: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <XDSChip onDismiss={() => {}}>Remove me</XDSChip>
      <XDSChip variant="info" onDismiss={() => {}}>
        Filter
      </XDSChip>
      <XDSChip variant="error" onDismiss={() => {}}>
        Error tag
      </XDSChip>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <XDSChip icon={<span>#</span>}>React</XDSChip>
      <XDSChip icon={<span>#</span>} variant="info">
        TypeScript
      </XDSChip>
      <XDSChip icon={<span>#</span>} variant="success" onDismiss={() => {}}>
        Approved
      </XDSChip>
    </div>
  ),
};
