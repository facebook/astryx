// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {XDSNavHeadingMenu, XDSNavHeadingMenuItem} from '@xds/core/NavMenu';
import {
  Cog6ToothIcon,
  UserIcon,
  ArrowRightStartOnRectangleIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const meta: Meta<typeof XDSNavHeadingMenu> = {
  title: 'Core/NavMenu',
  component: XDSNavHeadingMenu,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size — controls min-width and flows to items for padding',
    },
    minWidth: {
      control: 'number',
      description: 'Minimum width override',
    },
  },
  decorators: [
    Story => (
      <div style={{padding: 24, maxWidth: 300}}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof XDSNavHeadingMenu>;

export const Default: Story = {
  args: {
    size: 'md',
    children: (
      <>
        <XDSNavHeadingMenuItem label="Dashboard" href="#" />
        <XDSNavHeadingMenuItem label="Analytics" href="#" />
        <XDSNavHeadingMenuItem label="Settings" href="#" />
      </>
    ),
  },
};

export const WithIcons: Story = {
  args: {
    size: 'md',
    children: (
      <>
        <XDSNavHeadingMenuItem label="Profile" icon={UserIcon} href="#" />
        <XDSNavHeadingMenuItem
          label="Documents"
          icon={DocumentTextIcon}
          href="#"
        />
        <XDSNavHeadingMenuItem label="Analytics" icon={ChartBarIcon} href="#" />
        <XDSNavHeadingMenuItem
          label="Security"
          icon={ShieldCheckIcon}
          href="#"
        />
        <XDSNavHeadingMenuItem label="Settings" icon={Cog6ToothIcon} href="#" />
      </>
    ),
  },
};

export const WithDescriptions: Story = {
  args: {
    size: 'lg',
    children: (
      <>
        <XDSNavHeadingMenuItem
          label="Profile"
          description="Manage your account settings"
          icon={UserIcon}
          href="#"
        />
        <XDSNavHeadingMenuItem
          label="Settings"
          description="Configure application preferences"
          icon={Cog6ToothIcon}
          href="#"
        />
        <XDSNavHeadingMenuItem
          label="Sign out"
          description="End your current session"
          icon={ArrowRightStartOnRectangleIcon}
        />
      </>
    ),
  },
};

export const SmallSize: Story = {
  args: {
    size: 'sm',
    children: (
      <>
        <XDSNavHeadingMenuItem label="Edit" href="#" />
        <XDSNavHeadingMenuItem label="Duplicate" href="#" />
        <XDSNavHeadingMenuItem label="Delete" />
      </>
    ),
  },
};

export const DisabledItems: Story = {
  args: {
    size: 'md',
    children: (
      <>
        <XDSNavHeadingMenuItem label="Dashboard" href="#" />
        <XDSNavHeadingMenuItem label="Analytics" href="#" isDisabled />
        <XDSNavHeadingMenuItem label="Settings" href="#" />
        <XDSNavHeadingMenuItem label="Admin" isDisabled />
      </>
    ),
  },
};
