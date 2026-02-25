import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSSideNav,
  XDSSideNavHeader,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
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

const meta: Meta<typeof XDSSideNav> = {
  title: 'Navigation/XDSSideNav',
  component: XDSSideNav,
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
type Story = StoryObj<typeof XDSSideNav>;

// =============================================================================
// Basic
// =============================================================================

export const Default: Story = {
  render: () => (
    <XDSSideNav
      header={
        <XDSSideNavHeader
          icon={<XDSIcon icon={CubeIcon} size="lg" />}
          title="My App"
          titleHref="/"
        />
      }>
      <XDSSideNavSection title="Main">
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
          href="/dashboard"
        />
        <XDSSideNavItem
          label="Projects"
          icon={FolderIcon}
          selectedIcon={FolderIconSolid}
          href="/projects"
          endContent={<XDSBadge label="3" />}
        />
        <XDSSideNavItem
          label="Analytics"
          icon={ChartBarIcon}
          href="/analytics"
        />
        <XDSSideNavItem label="Team" icon={UserGroupIcon} href="/team" />
      </XDSSideNavSection>
      <XDSSideNavSection title="Documents">
        <XDSSideNavItem
          label="All Documents"
          icon={DocumentTextIcon}
          href="/documents"
        />
      </XDSSideNavSection>
    </XDSSideNav>
  ),
};

// =============================================================================
// With Header Menu
// =============================================================================

export const WithHeaderMenu: Story = {
  name: 'Header with Menu',
  render: () => (
    <XDSSideNav
      header={
        <XDSSideNavHeader
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
      <XDSSideNavSection title="Navigation">
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
        />
        <XDSSideNavItem label="Settings" icon={Cog6ToothIcon} />
      </XDSSideNavSection>
    </XDSSideNav>
  ),
};

// =============================================================================
// Suite Header
// =============================================================================

export const SuiteHeader: Story = {
  name: 'Suite with Independent Links',
  render: () => (
    <XDSSideNav
      header={
        <XDSSideNavHeader
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
      <XDSSideNavSection title="Main">
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
        />
        <XDSSideNavItem label="Projects" icon={FolderIcon} />
      </XDSSideNavSection>
    </XDSSideNav>
  ),
};

// =============================================================================
// Nested Items
// =============================================================================

export const NestedItems: Story = {
  name: 'Nested Items',
  render: () => (
    <XDSSideNav
      header={
        <XDSSideNavHeader
          icon={<XDSIcon icon={CubeIcon} size="lg" />}
          title="My App"
        />
      }>
      <XDSSideNavSection title="Main">
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
        />
        <XDSSideNavItem label="Settings" icon={Cog6ToothIcon}>
          <XDSSideNavItem label="General" href="/settings/general" />
          <XDSSideNavItem label="Security" href="/settings/security" />
          <XDSSideNavItem
            label="Notifications"
            href="/settings/notifications"
          />
        </XDSSideNavItem>
      </XDSSideNavSection>
    </XDSSideNav>
  ),
};

// =============================================================================
// With Footer
// =============================================================================

export const WithFooter: Story = {
  name: 'With Footer Icons',
  render: () => (
    <XDSSideNav
      header={
        <XDSSideNavHeader
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
      <XDSSideNavSection title="Main">
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
        />
        <XDSSideNavItem label="Projects" icon={FolderIcon} />
      </XDSSideNavSection>
    </XDSSideNav>
  ),
};

// =============================================================================
// Disabled Item
// =============================================================================

export const DisabledItem: Story = {
  name: 'Disabled Items',
  render: () => (
    <XDSSideNav
      header={
        <XDSSideNavHeader
          icon={<XDSIcon icon={CubeIcon} size="lg" />}
          title="My App"
        />
      }>
      <XDSSideNavSection title="Main">
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
        />
        <XDSSideNavItem label="Projects" icon={FolderIcon} />
        <XDSSideNavItem
          label="Analytics (Coming Soon)"
          icon={ChartBarIcon}
          isDisabled
        />
      </XDSSideNavSection>
    </XDSSideNav>
  ),
};

// =============================================================================
// Hidden Section Header
// =============================================================================

export const HiddenSectionHeader: Story = {
  name: 'Hidden Section Header',
  render: () => (
    <XDSSideNav
      header={
        <XDSSideNavHeader
          icon={<XDSIcon icon={CubeIcon} size="lg" />}
          title="My App"
        />
      }>
      <XDSSideNavSection title="Main navigation" isHeaderHidden>
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
        />
        <XDSSideNavItem label="Projects" icon={FolderIcon} />
        <XDSSideNavItem label="Analytics" icon={ChartBarIcon} />
      </XDSSideNavSection>
    </XDSSideNav>
  ),
};
