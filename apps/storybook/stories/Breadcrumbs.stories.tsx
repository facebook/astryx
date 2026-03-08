import type {Meta, StoryObj} from '@storybook/react';
import {XDSBreadcrumbs, XDSBreadcrumbItem} from '@xds/core/Breadcrumbs';
import {HomeIcon, Cog6ToothIcon, FolderIcon} from '@heroicons/react/24/outline';

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
    variant: {
      control: 'select',
      options: ['default', 'supporting'],
      description: 'Visual variant controlling text size and color',
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
    <XDSBreadcrumbs separator={'›'}>
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
        startIcon={<HomeIcon width={16} height={16} aria-hidden="true" />}>
        Home
      </XDSBreadcrumbItem>
      <XDSBreadcrumbItem
        href="/settings"
        startIcon={<Cog6ToothIcon width={16} height={16} aria-hidden="true" />}>
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

export const SupportingVariant: Story = {
  name: 'Supporting Variant',
  render: () => (
    <XDSBreadcrumbs variant="supporting">
      <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
      <XDSBreadcrumbItem href="/projects">Projects</XDSBreadcrumbItem>
      <XDSBreadcrumbItem isCurrent>My Project</XDSBreadcrumbItem>
    </XDSBreadcrumbs>
  ),
};

export const SupportingWithIcons: Story = {
  name: 'Supporting Variant with Icons',
  render: () => (
    <XDSBreadcrumbs variant="supporting">
      <XDSBreadcrumbItem
        href="/"
        startIcon={<HomeIcon width={14} height={14} aria-hidden="true" />}>
        Home
      </XDSBreadcrumbItem>
      <XDSBreadcrumbItem
        href="/projects"
        startIcon={<FolderIcon width={14} height={14} aria-hidden="true" />}>
        Projects
      </XDSBreadcrumbItem>
      <XDSBreadcrumbItem isCurrent>My Project</XDSBreadcrumbItem>
    </XDSBreadcrumbs>
  ),
};

/**
 * Shows `isCurrent` on a middle breadcrumb item rather than the last one.
 * This is useful when navigating to a child page that isn't represented
 * in the breadcrumb trail — the parent is still the "current" page in
 * the hierarchy.
 */
export const CurrentOnMiddleItem: Story = {
  name: 'Current on Middle Item',
  render: () => (
    <XDSBreadcrumbs>
      <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
      <XDSBreadcrumbItem isCurrent>Projects</XDSBreadcrumbItem>
      <XDSBreadcrumbItem href="/projects/my-project/settings">
        Settings
      </XDSBreadcrumbItem>
    </XDSBreadcrumbs>
  ),
};
