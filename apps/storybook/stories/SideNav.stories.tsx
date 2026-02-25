import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSSideNav,
  XDSSideNavHeader,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSText} from '@xds/core/Text';
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
          icon={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
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
// Title Without Icon
// =============================================================================

export const TitleWithoutIcon: Story = {
  name: 'Title Without Icon',
  render: () => (
    <XDSSideNav header={<XDSSideNavHeader title="My App" titleHref="/" />}>
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
        />
        <XDSSideNavItem
          label="Analytics"
          icon={ChartBarIcon}
          href="/analytics"
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
          icon={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
          title="Product Name"
          subtitle="Business Account"
          menu={
            <XDSList
              density="compact"
              header={
                <XDSText type="supporting" color="secondary">
                  Switch account
                </XDSText>
              }>
              <XDSListItem
                label="Personal Account"
                startContent={<XDSIcon icon={UserIcon} size="sm" />}
                href="#"
              />
              <XDSListItem
                label="Acme Corp"
                startContent={<XDSIcon icon={BuildingOfficeIcon} size="sm" />}
                href="#"
              />
              <XDSListItem
                label="Add account"
                startContent={<XDSIcon icon={PlusIcon} size="sm" />}
                href="#"
              />
              <XDSListItem
                label="Sign out"
                startContent={
                  <XDSIcon icon={ArrowRightStartOnRectangleIcon} size="sm" />
                }
                href="#"
              />
            </XDSList>
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
          icon={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
          supertitle="Suite Name"
          supertitleHref="/suite"
          title="Product Name"
          titleHref="/product"
          menu={
            <XDSList
              density="compact"
              header={
                <XDSText type="supporting" color="secondary">
                  Switch product
                </XDSText>
              }>
              <XDSListItem
                label="Analytics"
                startContent={<XDSIcon icon={ChartBarIcon} size="sm" />}
                href="#"
              />
              <XDSListItem
                label="Commerce"
                startContent={<XDSIcon icon={CubeIcon} size="sm" />}
                href="#"
              />
              <XDSListItem
                label="Team Hub"
                startContent={<XDSIcon icon={UserGroupIcon} size="sm" />}
                href="#"
              />
            </XDSList>
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
          icon={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
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
          icon={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
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
          icon={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
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
          icon={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
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
