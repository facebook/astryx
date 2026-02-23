import type {Meta, StoryObj} from '@storybook/react';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSBadge} from '@xds/core/Badge';
import {XDSIcon} from '@xds/core/Icon';
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  InboxIcon,
  PaperAirplaneIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';

const meta: Meta<typeof XDSList> = {
  title: 'Core/XDSList',
  component: XDSList,
  tags: ['autodocs'],
  argTypes: {
    density: {
      control: 'select',
      options: ['compact', 'balanced', 'spacious'],
      description: 'Spacing density for list items',
    },
    hasDividers: {
      control: 'boolean',
      description: 'Whether to show dividers between items',
    },
    listStyle: {
      control: 'select',
      options: ['none', 'disc', 'decimal', 'circle'],
      description: 'List marker style',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSList>;

export const Basic: Story = {
  render: args => (
    <XDSList {...args}>
      <XDSListItem label="Notifications" description="Manage your alerts" />
      <XDSListItem label="Privacy" description="Control your data" />
      <XDSListItem label="Security" description="Password and 2FA" />
    </XDSList>
  ),
};

export const WithDividers: Story = {
  render: args => (
    <XDSList hasDividers header={<strong>Settings</strong>} {...args}>
      <XDSListItem
        label="Notifications"
        description="Manage your alerts"
        startContent={<XDSIcon icon={BellIcon} />}
      />
      <XDSListItem
        label="Privacy"
        description="Control your data"
        startContent={<XDSIcon icon={ShieldCheckIcon} />}
      />
      <XDSListItem
        label="General"
        description="App preferences"
        startContent={<XDSIcon icon={Cog6ToothIcon} />}
      />
    </XDSList>
  ),
};

export const Compact: Story = {
  render: args => (
    <XDSList density="compact" hasDividers {...args}>
      <XDSListItem
        label="Notifications"
        onClick={() => {}}
        endContent={<XDSBadge label="3" />}
      />
      <XDSListItem
        label="Messages"
        onClick={() => {}}
        endContent={<XDSBadge label="12" />}
      />
      <XDSListItem label="Settings" onClick={() => {}} />
    </XDSList>
  ),
};

export const Spacious: Story = {
  render: args => (
    <XDSList density="spacious" {...args}>
      <XDSListItem
        label="Getting Started"
        description="Learn the basics of our platform"
      />
      <XDSListItem
        label="Advanced Topics"
        description="Deep dive into advanced features"
      />
      <XDSListItem
        label="API Reference"
        description="Complete API documentation"
      />
    </XDSList>
  ),
};

export const Interactive: Story = {
  render: args => (
    <XDSList {...args}>
      <XDSListItem
        label="Inbox"
        isSelected
        onClick={() => {}}
        startContent={<XDSIcon icon={InboxIcon} />}
        endContent={<XDSIcon icon={ChevronRightIcon} />}
      />
      <XDSListItem
        label="Sent"
        onClick={() => {}}
        startContent={<XDSIcon icon={PaperAirplaneIcon} />}
        endContent={<XDSIcon icon={ChevronRightIcon} />}
      />
      <XDSListItem
        label="Drafts"
        onClick={() => {}}
        startContent={<XDSIcon icon={DocumentIcon} />}
        endContent={<XDSIcon icon={ChevronRightIcon} />}
      />
    </XDSList>
  ),
};

export const Links: Story = {
  render: args => (
    <XDSList {...args}>
      <XDSListItem label="Documentation" href="/docs" />
      <XDSListItem
        label="GitHub"
        href="https://github.com"
        target="_blank"
        description="View source code"
      />
      <XDSListItem
        label="Storybook"
        href="/storybook"
        description="Component playground"
      />
    </XDSList>
  ),
};

export const OrderedList: Story = {
  render: args => (
    <XDSList listStyle="decimal" {...args}>
      <XDSListItem
        label="Install the package"
        description="npm install @xds/core"
      />
      <XDSListItem
        label="Import components"
        description="import { XDSList } from '@xds/core'"
      />
      <XDSListItem
        label="Start building"
        description="Use components in your app"
      />
    </XDSList>
  ),
};

export const BulletedList: Story = {
  render: args => (
    <XDSList listStyle="disc" {...args}>
      <XDSListItem label="Accessible by default" />
      <XDSListItem label="Themeable with StyleX" />
      <XDSListItem label="Composable and extensible" />
    </XDSList>
  ),
};

export const DisabledItems: Story = {
  render: args => (
    <XDSList {...args}>
      <XDSListItem label="Available" onClick={() => {}} />
      <XDSListItem label="Unavailable" onClick={() => {}} isDisabled />
      <XDSListItem label="Also Available" onClick={() => {}} />
    </XDSList>
  ),
};

export const WithMedia: Story = {
  render: args => (
    <XDSList hasDividers {...args}>
      <XDSListItem
        label="Alex Johnson"
        description="Hey, are we still on for lunch tomorrow?"
        startContent={<XDSAvatar name="Alex Johnson" size="md" />}
        onClick={() => {}}
        endContent={<XDSBadge label="2" />}
      />
      <XDSListItem
        label="Sam Rivera"
        description="I pushed the latest changes to the repo"
        startContent={<XDSAvatar name="Sam Rivera" size="md" />}
        onClick={() => {}}
      />
      <XDSListItem
        label="Jordan Lee"
        description="Can you review the design spec when you get a chance?"
        startContent={<XDSAvatar name="Jordan Lee" size="md" />}
        onClick={() => {}}
        endContent={<XDSBadge label="5" />}
      />
    </XDSList>
  ),
};
