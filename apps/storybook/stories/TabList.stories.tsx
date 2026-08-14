// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {TabList, Tab, TabMenu} from '@astryxdesign/core/TabList';
import {Carousel} from '@astryxdesign/core/Carousel';
import {Button} from '@astryxdesign/core/Button';
import {PlusIcon, FunnelIcon} from '@heroicons/react/24/outline';

const meta: Meta<typeof TabList> = {
  title: 'Core/TabList',
  component: TabList,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the tab hover targets',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TabList>;

export const Default: Story = {
  args: {
    size: 'md',
  },
  render: args => {
    const [value, setValue] = useState('home');
    return (
      <TabList value={value} onChange={setValue} size={args.size}>
        <Tab value="home" label="Home" />
        <Tab value="projects" label="Projects" />
        <Tab value="settings" label="Settings" />
      </TabList>
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
      <TabList value={value} onChange={setValue} size={args.size}>
        <Tab value="home" label="Home" />
        <Tab value="projects" label="Projects" />
        <TabMenu
          label="More"
          options={[
            {value: 'analytics', label: 'Analytics'},
            {value: 'reports', label: 'Reports'},
            {value: 'billing', label: 'Billing'},
          ]}
        />
      </TabList>
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
      <TabList value={value} onChange={setValue} size={args.size}>
        <Tab value="home" label="Home" />
        <Tab value="projects" label="Projects" />
        <TabMenu
          label="More"
          options={[
            {value: 'analytics', label: 'Analytics'},
            {value: 'reports', label: 'Reports'},
          ]}
        />
      </TabList>
    );
  },
};

export const SizeVariants: Story = {
  render: () => {
    const [value, setValue] = useState('home');
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
        {(['sm', 'md', 'lg'] as const).map(size => (
          <div key={size}>
            <div
              style={{
                marginBottom: '8px',
                fontSize: '12px',
                color: '#666',
                fontFamily: 'monospace',
              }}>
              size=\"{size}\"
            </div>
            <div style={{border: '1px dashed #ccc', display: 'inline-flex'}}>
              <TabList value={value} onChange={setValue} size={size}>
                <Tab value="home" label="Home" />
                <Tab value="projects" label="Projects" />
                <Tab value="settings" label="Settings" />
              </TabList>
            </div>
          </div>
        ))}
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
      <TabList value={value} onChange={setValue} size={args.size}>
        <Tab value="home" label="Home" icon={HomeIcon} />
        <Tab value="settings" label="Settings" icon={CogIcon} />
      </TabList>
    );
  },
};

export const IconOnly: Story = {
  args: {
    size: 'md',
  },
  render: args => {
    const [value, setValue] = useState('desktop');

    const DesktopIcon = (
      <svg viewBox="0 0 16 16" fill="currentColor" width="100%" height="100%">
        <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v5A1.5 1.5 0 0 0 2.5 11h4.75v1.5H5a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H8.75V11h4.75A1.5 1.5 0 0 0 15 9.5v-5A1.5 1.5 0 0 0 13.5 3h-11Zm0 1.5h11v5h-11v-5Z" />
      </svg>
    );

    const PhoneIcon = (
      <svg viewBox="0 0 16 16" fill="currentColor" width="100%" height="100%">
        <path d="M5 1.5A1.5 1.5 0 0 0 3.5 3v10A1.5 1.5 0 0 0 5 14.5h6a1.5 1.5 0 0 0 1.5-1.5V3A1.5 1.5 0 0 0 11 1.5H5Zm0 1.5h6v10H5V3Zm2.25 8.5a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1-.75-.75Z" />
      </svg>
    );

    const ThemeIcon = (
      <svg viewBox="0 0 16 16" fill="currentColor" width="100%" height="100%">
        <path d="M8 1.5a6.5 6.5 0 0 0 0 13h.25a1.75 1.75 0 0 0 1.2-3.02.35.35 0 0 1 .23-.6h.97A3.85 3.85 0 0 0 14.5 7.03 5.53 5.53 0 0 0 8.97 1.5H8Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm2-1.75a1 1 0 1 1 2 0 1 1 0 0 1-2 0ZM4.5 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm6-1.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
      </svg>
    );

    return (
      <TabList value={value} onChange={setValue} size={args.size}>
        <Tab
          value="desktop"
          label="Desktop preview"
          icon={DesktopIcon}
          isLabelHidden
        />
        <Tab
          value="phone"
          label="Phone preview"
          icon={PhoneIcon}
          isLabelHidden
        />
        <Tab value="theme" label="Theme" icon={ThemeIcon} isLabelHidden />
      </TabList>
    );
  },
};

/**
 * Demonstrates a common page header pattern: large tab list items on the left
 * with action buttons on the right, separated by a full-width divider underneath.
 */
export const WithActions: Story = {
  render: () => {
    const [value, setValue] = useState('all');
    return (
      <TabList value={value} onChange={setValue} size="lg" hasDivider>
        <Tab value="all" label="All items" />
        <Tab value="active" label="Active" />
        <Tab value="archived" label="Archived" />
        <div
          style={{
            marginInlineStart: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
          <Button
            label="Filter"
            variant="ghost"
            size="lg"
            icon={<FunnelIcon />}
            isIconOnly
          />
          <Button
            label="New item"
            variant="primary"
            size="lg"
            icon={<PlusIcon />}
          />
        </div>
      </TabList>
    );
  },
};

export const DividerGap: Story = {
  name: 'Divider Gap (sm / md / lg)',
  render: () => {
    const [value, setValue] = useState('overview');
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: '32px'}}>
        {(['sm', 'md', 'lg'] as const).map(size => (
          <div
            key={size}
            style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <span style={{font: '600 12px system-ui', color: '#4E606F'}}>
              size=&quot;{size}&quot; · hasDivider · matched Button size
            </span>
            <TabList value={value} onChange={setValue} size={size} hasDivider>
              <Tab value="overview" label="Overview" />
              <Tab value="activity" label="Activity" />
              <Tab value="settings" label="Settings" />
              <div
                style={{
                  marginInlineStart: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                <Button
                  label="Filter"
                  variant="ghost"
                  size={size}
                  icon={<FunnelIcon />}
                  isIconOnly
                />
                <Button
                  label="New item"
                  variant="primary"
                  size={size}
                  icon={<PlusIcon />}
                />
              </div>
            </TabList>
          </div>
        ))}
      </div>
    );
  },
};

export const FillLayout: Story = {
  render: () => {
    const [value, setValue] = useState('home');
    return (
      <div style={{width: '500px'}}>
        <TabList value={value} onChange={setValue} layout="fill" hasDivider>
          <Tab value="home" label="Home" />
          <Tab value="projects" label="Projects" />
          <Tab value="settings" label="Settings" />
        </TabList>
      </div>
    );
  },
};

/**
 * When tabs overflow, wrap TabList's children in Carousel.
 * The Carousel handles scroll, fade masks, and arrow buttons.
 * Each tab keeps its intrinsic label width — no truncation.
 */
export const Overflow: Story = {
  render: () => {
    const [value, setValue] = useState('overview');
    return (
      <div style={{maxWidth: '400px', border: '1px dashed #ccc'}}>
        <TabList value={value} onChange={setValue}>
          <Carousel gap={0.5} hasSnap={false}>
            <Tab value="overview" label="Overview" />
            <Tab value="activity" label="Activity" />
            <Tab value="members" label="Members" />
            <Tab value="settings" label="Settings" />
            <Tab value="integrations" label="Integrations" />
            <Tab value="billing" label="Billing & Plans" />
            <Tab value="security" label="Security" />
            <Tab value="notifications" label="Notifications" />
            <Tab value="api" label="API Keys" />
          </Carousel>
        </TabList>
      </div>
    );
  },
};

/**
 * Overflow with divider — typical page header in a narrow viewport.
 */
export const OverflowWithDivider: Story = {
  render: () => {
    const [value, setValue] = useState('dashboard');
    return (
      <div style={{maxWidth: '350px'}}>
        <TabList value={value} onChange={setValue} hasDivider size="lg">
          <Carousel gap={0.5} hasSnap={false}>
            <Tab value="dashboard" label="Dashboard" />
            <Tab value="analytics" label="Analytics" />
            <Tab value="reports" label="Reports" />
            <Tab value="customers" label="Customers" />
            <Tab value="products" label="Products" />
            <Tab value="orders" label="Orders" />
          </Carousel>
        </TabList>
      </div>
    );
  },
};
