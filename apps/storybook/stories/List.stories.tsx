// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {List, ListItem} from '@xds/core/List';
import {Avatar} from '@xds/core/Avatar';
import {Badge} from '@xds/core/Badge';
import {Icon} from '@xds/core/Icon';
import {Switch} from '@xds/core/Switch';
import {Text} from '@xds/core/Text';
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  InboxIcon,
  PaperAirplaneIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';

const meta: Meta<typeof List> = {
  title: 'Core/List',
  component: List,
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
type Story = StoryObj<typeof List>;

export const Basic: Story = {
  render: args => (
    <List {...args}>
      <ListItem label="Notifications" description="Manage your alerts" />
      <ListItem label="Privacy" description="Control your data" />
      <ListItem label="Security" description="Password and 2FA" />
    </List>
  ),
};

export const WithDividers: Story = {
  render: args => (
    <List hasDividers header={<strong>Settings</strong>} {...args}>
      <ListItem
        label="Notifications"
        description="Manage your alerts"
        startContent={<Icon icon={BellIcon} />}
      />
      <ListItem
        label="Privacy"
        description="Control your data"
        startContent={<Icon icon={ShieldCheckIcon} />}
      />
      <ListItem
        label="General"
        description="App preferences"
        startContent={<Icon icon={Cog6ToothIcon} />}
      />
    </List>
  ),
};

export const Compact: Story = {
  render: args => (
    <List density="compact" hasDividers {...args}>
      <ListItem
        label="Notifications"
        onClick={() => {}}
        endContent={<Badge label="3" />}
      />
      <ListItem
        label="Messages"
        onClick={() => {}}
        endContent={<Badge label="12" />}
      />
      <ListItem label="Settings" onClick={() => {}} />
    </List>
  ),
};

export const Spacious: Story = {
  render: args => (
    <List density="spacious" {...args}>
      <ListItem
        label="Getting Started"
        description="Learn the basics of our platform"
      />
      <ListItem
        label="Advanced Topics"
        description="Deep dive into advanced features"
      />
      <ListItem
        label="API Reference"
        description="Complete API documentation"
      />
    </List>
  ),
};

export const Interactive: Story = {
  render: args => (
    <List {...args}>
      <ListItem
        label="Inbox"
        isSelected
        onClick={() => {}}
        startContent={<Icon icon={InboxIcon} />}
        endContent={<Icon icon={ChevronRightIcon} />}
      />
      <ListItem
        label="Sent"
        onClick={() => {}}
        startContent={<Icon icon={PaperAirplaneIcon} />}
        endContent={<Icon icon={ChevronRightIcon} />}
      />
      <ListItem
        label="Drafts"
        onClick={() => {}}
        startContent={<Icon icon={DocumentIcon} />}
        endContent={<Icon icon={ChevronRightIcon} />}
      />
    </List>
  ),
};

export const Links: Story = {
  render: args => (
    <List {...args}>
      <ListItem label="Documentation" href="/docs" />
      <ListItem
        label="GitHub"
        href="https://github.com"
        target="_blank"
        description="View source code"
      />
      <ListItem
        label="Storybook"
        href="/storybook"
        description="Component playground"
      />
    </List>
  ),
};

export const OrderedList: Story = {
  render: args => (
    <List listStyle="decimal" {...args}>
      <ListItem
        label="Install the package"
        description="npm install @xds/core"
      />
      <ListItem
        label="Import components"
        description="import { List } from '@xds/core'"
      />
      <ListItem
        label="Start building"
        description="Use components in your app"
      />
    </List>
  ),
};

export const BulletedList: Story = {
  render: args => (
    <List listStyle="disc" {...args}>
      <ListItem label="Accessible by default" />
      <ListItem label="Themeable with StyleX" />
      <ListItem label="Composable and extensible" />
    </List>
  ),
};

export const DisabledItems: Story = {
  render: args => (
    <List {...args}>
      <ListItem label="Available" onClick={() => {}} />
      <ListItem label="Unavailable" onClick={() => {}} isDisabled />
      <ListItem label="Also Available" onClick={() => {}} />
    </List>
  ),
};

export const WithMedia: Story = {
  render: args => (
    <List hasDividers {...args}>
      <ListItem
        label="Alex Johnson"
        description="Hey, are we still on for lunch tomorrow?"
        startContent={<Avatar name="Alex Johnson" size={40} />}
        onClick={() => {}}
        endContent={<Badge label="2" />}
      />
      <ListItem
        label="Sam Rivera"
        description="I pushed the latest changes to the repo"
        startContent={<Avatar name="Sam Rivera" size={40} />}
        onClick={() => {}}
      />
      <ListItem
        label="Jordan Lee"
        description="Can you review the design spec when you get a chance?"
        startContent={<Avatar name="Jordan Lee" size={40} />}
        onClick={() => {}}
        endContent={<Badge label="5" />}
      />
    </List>
  ),
};

function ToggleHeaderDemo() {
  const [showArchived, setShowArchived] = useState(false);
  return (
    <List
      hasDividers
      header={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text type="label" size="lg">
            Notifications
          </Text>
          <Switch
            label="Show archived"
            value={showArchived}
            onChange={checked => setShowArchived(checked)}
          />
        </div>
      }>
      <ListItem
        label="New deployment succeeded"
        description="Production v2.4.1 deployed"
        startContent={<Icon icon={BellIcon} />}
      />
      <ListItem
        label="Security alert"
        description="Unusual login detected"
        startContent={<Icon icon={ShieldCheckIcon} />}
      />
      {showArchived && (
        <ListItem
          label="Archived: Build completed"
          description="CI pipeline finished"
          startContent={<Icon icon={Cog6ToothIcon} />}
        />
      )}
    </List>
  );
}

export const HeaderWithToggle: Story = {
  render: () => <ToggleHeaderDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'A list with a toggle in the header. The header and list are ' +
          'wrapped so they stack correctly even inside flex parents.',
      },
    },
  },
};

export const HeaderInFlexParent: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 24,
        border: '1px dashed #888',
        padding: 16,
      }}>
      <div style={{flex: 1}}>
        <Text type="label" size="lg">
          Sidebar
        </Text>
      </div>
      <div style={{flex: 2}}>
        <ToggleHeaderDemo />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the list with a header inside a flex parent. ' +
          'The header should appear above the list, not beside it.',
      },
    },
  },
};
