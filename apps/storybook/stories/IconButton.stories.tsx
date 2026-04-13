import type {Meta, StoryObj} from '@storybook/react';
import {XDSIconButton} from '@xds/core/IconButton';
import {
  Cog6ToothIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  HeartIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

const meta: Meta<typeof XDSIconButton> = {
  title: 'Core/XDSIconButton',
  component: XDSIconButton,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible label (aria-label)',
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
    isLoading: {
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
type Story = StoryObj<typeof XDSIconButton>;

export const Default: Story = {
  args: {
    label: 'Settings',
    icon: <Cog6ToothIcon />,
  },
};

export const Ghost: Story = {
  args: {
    label: 'Settings',
    icon: <Cog6ToothIcon />,
    variant: 'ghost',
  },
};

export const Primary: Story = {
  args: {
    label: 'Add item',
    icon: <PlusIcon />,
    variant: 'primary',
  },
};

export const Destructive: Story = {
  args: {
    label: 'Delete',
    icon: <TrashIcon />,
    variant: 'destructive',
  },
};

export const Small: Story = {
  args: {
    label: 'Close',
    icon: <XMarkIcon />,
    variant: 'ghost',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    label: 'Edit',
    icon: <PencilIcon />,
    size: 'lg',
  },
};

export const WithTooltip: Story = {
  args: {
    label: 'Notifications',
    icon: <BellIcon />,
    variant: 'ghost',
    tooltip: 'View notifications',
  },
};

export const Loading: Story = {
  args: {
    label: 'Saving',
    icon: <HeartIcon />,
    variant: 'primary',
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Edit',
    icon: <PencilIcon />,
    isDisabled: true,
  },
};

export const EmojiIcon: Story = {
  args: {
    label: 'React with rocket',
    icon: <span>🚀</span>,
    variant: 'ghost',
    size: 'sm',
  },
};
