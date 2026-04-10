import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSMoreMenu} from '@xds/core/MoreMenu';
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
        <XDSSideNavHeading
          icon={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
          heading="My App"
          headingHref="/"
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
    <XDSSideNav header={<XDSSideNavHeading heading="My App" headingHref="/" />}>
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
        <XDSSideNavHeading
          icon={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
          heading="Product Name"
          subheading="Business Account"
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
        <XDSSideNavHeading
          icon={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
          superheading="Suite Name"
          superheadingHref="/suite"
          heading="Product Name"
          headingHref="/product"
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
        <XDSSideNavHeading
          icon={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
          heading="My App"
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
        <XDSSideNavHeading
          icon={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
          heading="My App"
        />
      }
      footerIcons={
        <>
          <XDSButton
            label="Help"
            icon={<XDSIcon icon={QuestionMarkCircleIcon} size="md" />}
            variant="ghost"
            size="sm"
            isIconOnly
          />
          <XDSButton
            label="Notifications"
            icon={<XDSIcon icon={BellIcon} size="md" />}
            variant="ghost"
            size="sm"
            isIconOnly
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
        <XDSSideNavHeading
          icon={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
          heading="My App"
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
        <XDSSideNavHeading
          icon={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
          heading="My App"
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

// =============================================================================
// End Content
// =============================================================================

export const EndContent: Story = {
  name: 'End Content (Badges & Menus)',
  render: () => (
    <XDSSideNav
      header={
        <XDSSideNavHeading
          icon={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
          heading="My App"
          headingHref="/"
        />
      }>
      <XDSSideNavSection title="Navigation" isHeaderHidden>
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
          href="/dashboard"
          endContent={
            <XDSMoreMenu
              size="sm"
              items={[
                {label: 'Pin to top', onClick: () => {}},
                {label: 'Rename', onClick: () => {}},
                {label: 'Hide from sidebar', onClick: () => {}},
              ]}
            />
          }
        />
        <XDSSideNavItem
          label="Projects"
          icon={FolderIcon}
          href="/projects"
          endContent={<XDSBadge label={12} />}
        />
        <XDSSideNavItem
          label="Analytics"
          icon={ChartBarIcon}
          href="/analytics"
          endContent={<XDSBadge label="New" />}
        />
        <XDSSideNavItem
          label="Team"
          icon={UserGroupIcon}
          href="/team"
          endContent={
            <XDSText type="supporting" color="secondary">
              8 members
            </XDSText>
          }
        />
        <XDSSideNavItem
          label="Notifications"
          icon={BellIcon}
          href="/notifications"
          endContent={
            <XDSButton
              label="Settings"
              icon={
                <XDSIcon icon={Cog6ToothIcon} size="sm" color="secondary" />
              }
              variant="ghost"
              size="sm"
              isIconOnly
            />
          }
        />
        <XDSSideNavItem
          label="Documents"
          icon={DocumentTextIcon}
          href="/documents"
          endContent={
            <XDSText type="supporting" color="secondary">
              ⌘D
            </XDSText>
          }
        />
        <XDSSideNavItem
          label="Settings"
          icon={Cog6ToothIcon}
          href="/settings"
          endContent={
            <XDSText type="supporting" color="secondary">
              3 pending
            </XDSText>
          }
        />
        <XDSSideNavItem
          label="A very long navigation label that should truncate with ellipsis"
          icon={DocumentTextIcon}
          href="/long"
          endContent={<XDSBadge label={99} />}
        />
      </XDSSideNavSection>
    </XDSSideNav>
  ),
};

// =============================================================================
// Header End Content
// =============================================================================

export const HeaderEndContent: Story = {
  name: 'Header End Content',
  render: () => (
    <XDSSideNav
      header={
        <XDSSideNavHeading
          icon={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
          heading="My App"
          headingHref="/"
          headerEndContent={<XDSBadge label="3" variant="error" />}
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
// Header End Content + Menu
// =============================================================================

export const HeaderEndContentWithMenu: Story = {
  name: 'Header End Content + Menu',
  render: () => (
    <XDSSideNav
      header={
        <XDSSideNavHeading
          icon={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
          heading="Product Name"
          subheading="Business Account"
          headerEndContent={<XDSBadge label="New" variant="info" />}
          menu={
            <XDSList density="compact">
              <XDSListItem label="Switch Account" href="#" />
              <XDSListItem label="Sign Out" href="#" />
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
      </XDSSideNavSection>
    </XDSSideNav>
  ),
};
