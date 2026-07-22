// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {
  Breadcrumbs,
  BreadcrumbItem,
  BreadcrumbMenuItem,
} from '@astryxdesign/core/Breadcrumbs';
import type {BreadcrumbMenuOption} from '@astryxdesign/core/Breadcrumbs';
import {HomeIcon, Cog6ToothIcon, FolderIcon} from '@heroicons/react/24/outline';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Core/Breadcrumbs',
  component: Breadcrumbs,
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
type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  render: () => (
    <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const TwoLevels: Story = {
  render: () => (
    <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Settings</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const AutoDetectCurrent: Story = {
  name: 'Auto-detect Current',
  render: () => (
    <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem>Auto Current</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const CustomSeparator: Story = {
  render: () => (
    <Breadcrumbs separator={'›'}>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
      <BreadcrumbItem isCurrent>API Reference</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Breadcrumbs>
      <BreadcrumbItem
        href="/"
        startIcon={<HomeIcon width={16} height={16} aria-hidden="true" />}>
        Home
      </BreadcrumbItem>
      <BreadcrumbItem
        href="/settings"
        startIcon={<Cog6ToothIcon width={16} height={16} aria-hidden="true" />}>
        Settings
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>Profile</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const WithOnClick: Story = {
  render: () => (
    <Breadcrumbs>
      <BreadcrumbItem
        href="/"
        onClick={e => {
          e.preventDefault();
          console.log('Navigate to Home');
        }}>
        Home
      </BreadcrumbItem>
      <BreadcrumbItem
        href="/projects"
        onClick={e => {
          e.preventDefault();
          console.log('Navigate to Projects');
        }}>
        Projects
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>Detail</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const DeepHierarchy: Story = {
  render: () => (
    <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/products">Products</BreadcrumbItem>
      <BreadcrumbItem href="/products/electronics">Electronics</BreadcrumbItem>
      <BreadcrumbItem href="/products/electronics/phones">
        Phones
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>iPhone 15 Pro</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const SupportingVariant: Story = {
  name: 'Supporting Variant',
  render: () => (
    <Breadcrumbs variant="supporting">
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const SupportingWithIcons: Story = {
  name: 'Supporting Variant with Icons',
  render: () => (
    <Breadcrumbs variant="supporting">
      <BreadcrumbItem
        href="/"
        startIcon={<HomeIcon width={14} height={14} aria-hidden="true" />}>
        Home
      </BreadcrumbItem>
      <BreadcrumbItem
        href="/projects"
        startIcon={<FolderIcon width={14} height={14} aria-hidden="true" />}>
        Projects
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
    </Breadcrumbs>
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
    <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Projects</BreadcrumbItem>
      <BreadcrumbItem href="/projects/my-project/settings">
        Settings
      </BreadcrumbItem>
    </Breadcrumbs>
  ),
};

const teamMenu: BreadcrumbMenuOption[] = [
  {label: 'Design', onClick: () => console.log('go /team/design')},
  {label: 'Engineering', onClick: () => console.log('go /team/eng')},
  {type: 'divider'},
  {label: 'Data', icon: 'chart', onClick: () => console.log('go /team/data')},
];

/**
 * A mid-trail crumb can open a menu of sibling destinations. The `menu` prop
 * accepts the SAME item API as `DropdownMenu` / `MoreMenu` / `ContextMenu`, so
 * an existing `DropdownMenuOption[]` drops in verbatim. The crumb renders a
 * link-styled trigger with a trailing chevron; separators before and after are
 * unaffected.
 */
export const MenuCrumb: Story = {
  name: 'Menu Crumb (data array)',
  render: () => (
    <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem menu={teamMenu}>Teams</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Overview</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

/**
 * The `menu` prop also accepts composed `BreadcrumbMenuItem` children (an alias
 * of `DropdownMenuItem`), for dynamic or stateful menus.
 */
export const MenuCrumbComposed: Story = {
  name: 'Menu Crumb (composed children)',
  render: () => (
    <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem
        menu={
          <>
            <BreadcrumbMenuItem
              label="Overview"
              onClick={() => console.log('overview')}
            />
            <BreadcrumbMenuItem
              label="Settings"
              icon="gear"
              onClick={() => console.log('settings')}
            />
          </>
        }>
        Project
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>Details</BreadcrumbItem>
    </Breadcrumbs>
  ),
};
