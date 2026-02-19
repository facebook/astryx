import type {Meta, StoryObj} from '@storybook/react';
import {XDSBreadcrumbs, XDSBreadcrumbItem} from '@xds/core/Breadcrumbs';

const meta: Meta<typeof XDSBreadcrumbs> = {
  title: 'Navigation/XDSBreadcrumbs',
  component: XDSBreadcrumbs,
  tags: ['autodocs'],
  argTypes: {
    separator: {
      control: 'text',
      description: 'Separator between items',
    },
    label: {
      control: 'text',
      description: 'Accessible label for the nav landmark',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSBreadcrumbs>;

export const Default: Story = {
  render: () => (
    <XDSBreadcrumbs>
      <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
      <XDSBreadcrumbItem href="/projects">Projects</XDSBreadcrumbItem>
      <XDSBreadcrumbItem isCurrent>My Project</XDSBreadcrumbItem>
    </XDSBreadcrumbs>
  ),
};

export const TwoLevels: Story = {
  render: () => (
    <XDSBreadcrumbs>
      <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
      <XDSBreadcrumbItem isCurrent>Settings</XDSBreadcrumbItem>
    </XDSBreadcrumbs>
  ),
};

export const AutoDetectCurrent: Story = {
  name: 'Auto-detect Current',
  render: () => (
    <XDSBreadcrumbs>
      <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
      <XDSBreadcrumbItem href="/projects">Projects</XDSBreadcrumbItem>
      <XDSBreadcrumbItem>Auto Current</XDSBreadcrumbItem>
    </XDSBreadcrumbs>
  ),
};

export const CustomSeparator: Story = {
  render: () => (
    <XDSBreadcrumbs separator={'\u203a'}>
      <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
      <XDSBreadcrumbItem href="/docs">Docs</XDSBreadcrumbItem>
      <XDSBreadcrumbItem isCurrent>API Reference</XDSBreadcrumbItem>
    </XDSBreadcrumbs>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <XDSBreadcrumbs>
      <XDSBreadcrumbItem
        href="/"
        startIcon={<span aria-hidden="true">{'\ud83c\udfe0'}</span>}>
        Home
      </XDSBreadcrumbItem>
      <XDSBreadcrumbItem
        href="/settings"
        startIcon={<span aria-hidden="true">{'\u2699\ufe0f'}</span>}>
        Settings
      </XDSBreadcrumbItem>
      <XDSBreadcrumbItem isCurrent>Profile</XDSBreadcrumbItem>
    </XDSBreadcrumbs>
  ),
};

export const WithOnClick: Story = {
  render: () => (
    <XDSBreadcrumbs>
      <XDSBreadcrumbItem
        href="/"
        onClick={e => {
          e.preventDefault();
          console.log('Navigate to Home');
        }}>
        Home
      </XDSBreadcrumbItem>
      <XDSBreadcrumbItem
        href="/projects"
        onClick={e => {
          e.preventDefault();
          console.log('Navigate to Projects');
        }}>
        Projects
      </XDSBreadcrumbItem>
      <XDSBreadcrumbItem isCurrent>Detail</XDSBreadcrumbItem>
    </XDSBreadcrumbs>
  ),
};

export const DeepHierarchy: Story = {
  render: () => (
    <XDSBreadcrumbs>
      <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
      <XDSBreadcrumbItem href="/products">Products</XDSBreadcrumbItem>
      <XDSBreadcrumbItem href="/products/electronics">
        Electronics
      </XDSBreadcrumbItem>
      <XDSBreadcrumbItem href="/products/electronics/phones">
        Phones
      </XDSBreadcrumbItem>
      <XDSBreadcrumbItem isCurrent>iPhone 15 Pro</XDSBreadcrumbItem>
    </XDSBreadcrumbs>
  ),
};
