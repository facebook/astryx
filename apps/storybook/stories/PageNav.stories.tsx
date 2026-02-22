import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSPageNav,
  XDSPageNavHeader,
  XDSPageNavItem,
  XDSPageNavSection,
} from '@xds/core/PageNav';
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSDivider} from '@xds/core/Divider';
import {XDSIcon} from '@xds/core/Icon';
import {XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Stack';
import {
  HomeIcon,
  FolderIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  UserGroupIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  CubeIcon,
  BuildingOfficeIcon,
  UserIcon,
  PlusIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  FolderIcon as FolderIconSolid,
} from '@heroicons/react/24/solid';

const meta: Meta<typeof XDSPageNav> = {
  title: 'Navigation/XDSPageNav',
  component: XDSPageNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <div style={{width: 280, height: 600, border: '1px solid #e5e7eb'}}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof XDSPageNav>;

// =============================================================================
// Basic
// =============================================================================

export const Default: Story = {
  render: () => (
    <XDSPageNav
      header={
        <XDSPageNavHeader
          icon={<XDSIcon icon={CubeIcon} size="lg" />}
          title="My App"
          titleHref="/"
        />
      }>
      <XDSPageNavSection title="Main">
        <XDSPageNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
          href="/dashboard"
        />
        <XDSPageNavItem
          label="Projects"
          icon={FolderIcon}
          selectedIcon={FolderIconSolid}
          href="/projects"
          endContent={<XDSBadge label="3" />}
        />
        <XDSPageNavItem
          label="Analytics"
          icon={ChartBarIcon}
          href="/analytics"
        />
        <XDSPageNavItem label="Team" icon={UserGroupIcon} href="/team" />
      </XDSPageNavSection>
      <XDSPageNavSection title="Documents">
        <XDSPageNavItem
          label="All Documents"
          icon={DocumentTextIcon}
          href="/documents"
        />
      </XDSPageNavSection>
    </XDSPageNav>
  ),
};

// =============================================================================
// With Header Menu
// =============================================================================

export const WithHeaderMenu: Story = {
  name: 'Header with Menu',
  render: () => (
    <XDSPageNav
      header={
        <XDSPageNavHeader
          icon={<XDSIcon icon={CubeIcon} size="lg" />}
          title="Product Name"
          subtitle="Business Account"
          menu={
            <div style={{padding: 12}}>
              <XDSVStack gap="space2">
                <XDSText type="supporting" color="secondary">
                  Switch account
                </XDSText>
                <XDSButton
                  label="Personal Account"
                  icon={<XDSIcon icon={UserIcon} size="sm" />}
                  variant="ghost"
                  size="sm"
                />
                <XDSButton
                  label="Acme Corp"
                  icon={<XDSIcon icon={BuildingOfficeIcon} size="sm" />}
                  variant="ghost"
                  size="sm"
                />
                <XDSDivider />
                <XDSButton
                  label="Add account"
                  icon={<XDSIcon icon={PlusIcon} size="sm" />}
                  variant="ghost"
                  size="sm"
                />
                <XDSButton
                  label="Sign out"
                  icon={
                    <XDSIcon icon={ArrowRightStartOnRectangleIcon} size="sm" />
                  }
                  variant="ghost"
                  size="sm"
                />
              </XDSVStack>
            </div>
          }
        />
      }>
      <XDSPageNavSection title="Navigation">
        <XDSPageNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
        />
        <XDSPageNavItem label="Settings" icon={Cog6ToothIcon} />
      </XDSPageNavSection>
    </XDSPageNav>
  ),
};

// =============================================================================
// Suite Header
// =============================================================================

export const SuiteHeader: Story = {
  name: 'Suite with Independent Links',
  render: () => (
    <XDSPageNav
      header={
        <XDSPageNavHeader
          icon={<XDSIcon icon={CubeIcon} size="lg" />}
          supertitle="Suite Name"
          supertitleHref="/suite"
          title="Product Name"
          titleHref="/product"
          menu={
            <div style={{padding: 12}}>
              <XDSVStack gap="space1">
                <XDSText type="supporting" color="secondary">
                  Switch product
                </XDSText>
                <XDSButton
                  label="Analytics"
                  icon={<XDSIcon icon={ChartBarIcon} size="sm" />}
                  variant="ghost"
                  size="sm"
                />
                <XDSButton
                  label="Commerce"
                  icon={<XDSIcon icon={CubeIcon} size="sm" />}
                  variant="ghost"
                  size="sm"
                />
                <XDSButton
                  label="Team Hub"
                  icon={<XDSIcon icon={UserGroupIcon} size="sm" />}
                  variant="ghost"
                  size="sm"
                />
              </XDSVStack>
            </div>
          }
        />
      }>
      <XDSPageNavSection title="Main">
        <XDSPageNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
        />
        <XDSPageNavItem label="Projects" icon={FolderIcon} />
      </XDSPageNavSection>
    </XDSPageNav>
  ),
};

// =============================================================================
// Nested Items
// =============================================================================

export const NestedItems: Story = {
  name: 'Nested Items',
  render: () => (
    <XDSPageNav
      header={
        <XDSPageNavHeader
          icon={<XDSIcon icon={CubeIcon} size="lg" />}
          title="My App"
        />
      }>
      <XDSPageNavSection title="Main">
        <XDSPageNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
        />
        <XDSPageNavItem label="Settings" icon={Cog6ToothIcon}>
          <XDSPageNavItem label="General" href="/settings/general" />
          <XDSPageNavItem label="Security" href="/settings/security" />
          <XDSPageNavItem
            label="Notifications"
            href="/settings/notifications"
          />
        </XDSPageNavItem>
      </XDSPageNavSection>
    </XDSPageNav>
  ),
};

// =============================================================================
// With Footer
// =============================================================================

export const WithFooter: Story = {
  name: 'With Footer Icons',
  render: () => (
    <XDSPageNav
      header={
        <XDSPageNavHeader
          icon={<XDSIcon icon={CubeIcon} size="lg" />}
          title="My App"
        />
      }
      footerIcons={
        <>
          <XDSButton
            label="Help"
            icon={<XDSIcon icon={QuestionMarkCircleIcon} size="md" />}
            variant="ghost"
            size="sm"
          />
          <XDSButton
            label="Notifications"
            icon={<XDSIcon icon={BellIcon} size="md" />}
            variant="ghost"
            size="sm"
          />
        </>
      }>
      <XDSPageNavSection title="Main">
        <XDSPageNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
        />
        <XDSPageNavItem label="Projects" icon={FolderIcon} />
      </XDSPageNavSection>
    </XDSPageNav>
  ),
};

// =============================================================================
// Disabled Item
// =============================================================================

export const DisabledItem: Story = {
  name: 'Disabled Items',
  render: () => (
    <XDSPageNav
      header={
        <XDSPageNavHeader
          icon={<XDSIcon icon={CubeIcon} size="lg" />}
          title="My App"
        />
      }>
      <XDSPageNavSection title="Main">
        <XDSPageNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
        />
        <XDSPageNavItem label="Projects" icon={FolderIcon} />
        <XDSPageNavItem
          label="Analytics (Coming Soon)"
          icon={ChartBarIcon}
          isDisabled
        />
      </XDSPageNavSection>
    </XDSPageNav>
  ),
};

// =============================================================================
// Hidden Section Header
// =============================================================================

export const HiddenSectionHeader: Story = {
  name: 'Hidden Section Header',
  render: () => (
    <XDSPageNav
      header={
        <XDSPageNavHeader
          icon={<XDSIcon icon={CubeIcon} size="lg" />}
          title="My App"
        />
      }>
      <XDSPageNavSection title="Main navigation" isHeaderHidden>
        <XDSPageNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
        />
        <XDSPageNavItem label="Projects" icon={FolderIcon} />
        <XDSPageNavItem label="Analytics" icon={ChartBarIcon} />
      </XDSPageNavSection>
    </XDSPageNav>
  ),
};
