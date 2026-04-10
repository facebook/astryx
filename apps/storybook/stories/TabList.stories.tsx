import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSTabList, XDSTab, XDSTabMenu} from '@xds/core/TabList';
import {XDSButton} from '@xds/core/Button';
import {XDSDivider} from '@xds/core/Divider';
import {XDSHStack} from '@xds/core/Stack';
import {XDSStackItem} from '@xds/core/Stack';
import {PlusIcon, FunnelIcon} from '@heroicons/react/24/outline';

const meta: Meta<typeof XDSTabList> = {
  title: 'Navigation/XDSTabList',
  component: XDSTabList,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant for tabs',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSTabList>;

export const Default: Story = {
  args: {
    size: 'md',
  },
  render: args => {
    const [value, setValue] = useState('home');
    return (
      <XDSTabList value={value} onChange={setValue} size={args.size}>
        <XDSTab value="home" label="Home" />
        <XDSTab value="projects" label="Projects" />
        <XDSTab value="settings" label="Settings" />
      </XDSTabList>
    );
  },
};

export const WithMenu: Story = {
  args: {
    size: 'md',
  },
  render: args => {
    const [value, setValue] = useState('home');
    return (
      <XDSTabList value={value} onChange={setValue} size={args.size}>
        <XDSTab value="home" label="Home" />
        <XDSTab value="projects" label="Projects" />
        <XDSTabMenu
          label="More"
          options={[
            {value: 'analytics', label: 'Analytics'},
            {value: 'reports', label: 'Reports'},
            {value: 'billing', label: 'Billing'},
          ]}
        />
      </XDSTabList>
    );
  },
};

export const MenuWithSelectedChild: Story = {
  args: {
    size: 'md',
  },
  render: args => {
    const [value, setValue] = useState('analytics');
    return (
      <XDSTabList value={value} onChange={setValue} size={args.size}>
        <XDSTab value="home" label="Home" />
        <XDSTab value="projects" label="Projects" />
        <XDSTabMenu
          label="More"
          options={[
            {value: 'analytics', label: 'Analytics'},
            {value: 'reports', label: 'Reports'},
          ]}
        />
      </XDSTabList>
    );
  },
};

export const SizeVariants: Story = {
  render: () => {
    const [value, setValue] = useState('home');
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
        <div>
          <div style={{marginBottom: '8px', fontSize: '12px', color: '#666'}}>
            Small
          </div>
          <XDSTabList value={value} onChange={setValue} size="sm">
            <XDSTab value="home" label="Home" />
            <XDSTab value="projects" label="Projects" />
            <XDSTab value="settings" label="Settings" />
          </XDSTabList>
        </div>
        <div>
          <div style={{marginBottom: '8px', fontSize: '12px', color: '#666'}}>
            Medium (default)
          </div>
          <XDSTabList value={value} onChange={setValue} size="md">
            <XDSTab value="home" label="Home" />
            <XDSTab value="projects" label="Projects" />
            <XDSTab value="settings" label="Settings" />
          </XDSTabList>
        </div>
        <div>
          <div style={{marginBottom: '8px', fontSize: '12px', color: '#666'}}>
            Large
          </div>
          <XDSTabList value={value} onChange={setValue} size="lg">
            <XDSTab value="home" label="Home" />
            <XDSTab value="projects" label="Projects" />
            <XDSTab value="settings" label="Settings" />
          </XDSTabList>
        </div>
      </div>
    );
  },
};

export const WithIcons: Story = {
  args: {
    size: 'md',
  },
  render: args => {
    const [value, setValue] = useState('home');

    // Inline SVG icons for the story
    const HomeIcon = (
      <svg viewBox="0 0 16 16" fill="currentColor" width="100%" height="100%">
        <path d="M8.543 2.232a.75.75 0 0 0-1.085 0l-5.25 5.5A.75.75 0 0 0 2.75 9H4v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V9h1.25a.75.75 0 0 0 .543-1.268l-5.25-5.5Z" />
      </svg>
    );

    const CogIcon = (
      <svg viewBox="0 0 16 16" fill="currentColor" width="100%" height="100%">
        <path
          fillRule="evenodd"
          d="M6.955 1.45A.5.5 0 0 1 7.452 1h1.096a.5.5 0 0 1 .497.45l.17 1.699c.484.12.94.312 1.356.562l1.321-.816a.5.5 0 0 1 .67.087l.774.774a.5.5 0 0 1 .087.67l-.816 1.321c.25.416.442.872.562 1.356l1.699.17a.5.5 0 0 1 .45.497v1.096a.5.5 0 0 1-.45.497l-1.699.17c-.12.484-.312.94-.562 1.356l.816 1.321a.5.5 0 0 1-.087.67l-.774.774a.5.5 0 0 1-.67.087l-1.321-.816c-.416.25-.872.442-1.356.562l-.17 1.699a.5.5 0 0 1-.497.45H7.452a.5.5 0 0 1-.497-.45l-.17-1.699a4.973 4.973 0 0 1-1.356-.562l-1.321.816a.5.5 0 0 1-.67-.087l-.774-.774a.5.5 0 0 1-.087-.67l.816-1.321a4.972 4.972 0 0 1-.562-1.356l-1.699-.17A.5.5 0 0 1 1 8.548V7.452a.5.5 0 0 1 .45-.497l1.699-.17c.12-.484.312-.94.562-1.356l-.816-1.321a.5.5 0 0 1 .087-.67l.774-.774a.5.5 0 0 1 .67-.087l1.321.816c.416-.25.872-.442 1.356-.562l.17-1.699ZM8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
          clipRule="evenodd"
        />
      </svg>
    );

    return (
      <XDSTabList value={value} onChange={setValue} size={args.size}>
        <XDSTab value="home" label="Home" icon={HomeIcon} />
        <XDSTab value="settings" label="Settings" icon={CogIcon} />
      </XDSTabList>
    );
  },
};

/**
 * Demonstrates a common page header pattern: large tab list items on the left
 * with action buttons on the right, separated by a full-width divider underneath.
 *
 * Uses `XDSHStack` with `XDSStackItem size="fill"` to push the actions to the
 * trailing edge, and `XDSDivider` below for visual separation from page content.
 */
export const WithActions: Story = {
  render: () => {
    const [value, setValue] = useState('all');
    return (
      <div>
        <XDSHStack vAlign="center">
          <XDSStackItem size="fill">
            <XDSTabList value={value} onChange={setValue} size="lg">
              <XDSTab value="all" label="All items" />
              <XDSTab value="active" label="Active" />
              <XDSTab value="archived" label="Archived" />
            </XDSTabList>
          </XDSStackItem>
          <XDSStackItem>
            <XDSHStack gap={1} vAlign="center">
              <XDSButton
                label="Filter"
                variant="ghost"
                size="md"
                icon={<FunnelIcon />}
                isIconOnly
              />
              <XDSButton
                label="New item"
                variant="primary"
                size="md"
                icon={<PlusIcon />}
              />
            </XDSHStack>
          </XDSStackItem>
        </XDSHStack>
        <XDSDivider />
      </div>
    );
  },
};
