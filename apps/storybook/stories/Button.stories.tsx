import type { Meta, StoryObj } from '@storybook/react';
import { XDSButton } from '@xds/core/Button';

const meta: Meta<typeof XDSButton> = {
  title: 'Core/XDSButton',
  component: XDSButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive'],
      description: 'Visual style variant',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSButton>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Loading...',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Disabled',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '600px' }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <XDSButton variant="primary">Primary</XDSButton>
        <XDSButton variant="secondary">Secondary</XDSButton>
        <XDSButton variant="ghost">Ghost</XDSButton>
        <XDSButton variant="destructive">Destructive</XDSButton>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <XDSButton variant="primary" loading>Loading...</XDSButton>
        <XDSButton variant="secondary" loading>Loading...</XDSButton>
        <XDSButton variant="ghost" loading>Loading...</XDSButton>
        <XDSButton variant="destructive" loading>Loading...</XDSButton>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <XDSButton variant="primary" disabled>Disabled</XDSButton>
        <XDSButton variant="secondary" disabled>Disabled</XDSButton>
        <XDSButton variant="ghost" disabled>Disabled</XDSButton>
        <XDSButton variant="destructive" disabled>Disabled</XDSButton>
      </div>
    </div>
  ),
};
