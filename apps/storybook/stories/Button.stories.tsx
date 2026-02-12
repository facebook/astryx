import type {Meta, StoryObj} from '@storybook/react';
import {XDSButton} from '@xds/core/Button';
import {Cog6ToothIcon, TrashIcon} from '@heroicons/react/24/outline';

const meta: Meta<typeof XDSButton> = {
  title: 'Core/XDSButton',
  component: XDSButton,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible label (required)',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSButton>;

export const Primary: Story = {
  args: {
    label: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    label: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    label: 'Ghost Button',
    variant: 'ghost',
  },
};

export const Destructive: Story = {
  args: {
    label: 'Delete',
    variant: 'destructive',
  },
};

export const Loading: Story = {
  args: {
    label: 'Loading...',
    variant: 'primary',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    variant: 'primary',
    isDisabled: true,
  },
};

export const SizeVariants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
      <XDSButton label="Small" variant="primary" size="sm" />
      <XDSButton label="Medium" variant="primary" size="md" />
      <XDSButton label="Large" variant="primary" size="lg" />
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '12px'}}>
      <XDSButton
        label="Settings"
        variant="ghost"
        icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
      />
      <XDSButton
        label="Delete"
        variant="destructive"
        icon={<TrashIcon style={{width: 16, height: 16}} />}
      />
    </div>
  ),
};

export const IconWithText: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '12px'}}>
      <XDSButton
        label="Settings"
        variant="secondary"
        icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}>
        Settings
      </XDSButton>
      <XDSButton
        label="Delete"
        variant="destructive"
        icon={<TrashIcon style={{width: 16, height: 16}} />}>
        Delete
      </XDSButton>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '600px',
      }}>
      <div style={{display: 'flex', gap: '12px'}}>
        <XDSButton label="Primary" variant="primary" />
        <XDSButton label="Secondary" variant="secondary" />
        <XDSButton label="Ghost" variant="ghost" />
        <XDSButton label="Destructive" variant="destructive" />
      </div>
      <div style={{display: 'flex', gap: '12px'}}>
        <XDSButton label="Loading..." variant="primary" loading />
        <XDSButton label="Loading..." variant="secondary" loading />
        <XDSButton label="Loading..." variant="ghost" loading />
        <XDSButton label="Loading..." variant="destructive" loading />
      </div>
      <div style={{display: 'flex', gap: '12px'}}>
        <XDSButton label="Disabled" variant="primary" isDisabled />
        <XDSButton label="Disabled" variant="secondary" isDisabled />
        <XDSButton label="Disabled" variant="ghost" isDisabled />
        <XDSButton label="Disabled" variant="destructive" isDisabled />
      </div>
      <div style={{display: 'flex', gap: '12px'}}>
        <XDSButton
          label="Settings"
          variant="ghost"
          icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
        />
        <XDSButton
          label="Settings"
          variant="secondary"
          icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}>
          Settings
        </XDSButton>
      </div>
    </div>
  ),
};
