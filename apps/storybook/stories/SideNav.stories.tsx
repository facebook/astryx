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
// Bug Repro: Heading Overflow (#1069)
// =============================================================================

export const HeadingOverflow: Story = {
  name: 'Bug #1069: Heading Overflow',
  decorators: [
    Story => (
      <div
        style={{
          display: 'flex',
          gap: 24,
          alignItems: 'flex-start',
        }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      {/* Case 1: Long unbroken strings */}
      <div style={{width: 280, height: 400, border: '1px solid #e5e7eb'}}>
        <XDSSideNav
          header={
            <XDSSideNavHeading
              icon={
                <XDSNavIcon
                  icon={<CubeIcon style={{width: 16, height: 16}} />}
                />
              }
              heading="this_is_a_long_unbroken_application_name"
              superheading="very_long_unbroken_username_that_should_truncate"
              headingHref="/"
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
      </div>

      {/* Case 2: Unbroken heading + subheading + menu */}
      <div style={{width: 280, height: 400, border: '1px solid #e5e7eb'}}>
        <XDSSideNav
          header={
            <XDSSideNavHeading
              icon={
                <XDSNavIcon
                  icon={<CubeIcon style={{width: 16, height: 16}} />}
                />
              }
              heading="my_super_long_unbroken_app_name_here"
              subheading="really_long_business_account_name@company.com"
              menu={
                <XDSList density="compact">
                  <XDSListItem label="Switch account" href="#" />
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
      </div>

      {/* Case 3: Narrow container — simulates resized sidebar */}
      <div style={{width: 180, height: 400, border: '1px solid #e5e7eb'}}>
        <XDSSideNav
          header={
            <XDSSideNavHeading
              icon={
                <XDSNavIcon
                  icon={<CubeIcon style={{width: 16, height: 16}} />}
                />
              }
              heading="normal_app_name"
              superheading="username"
              headingHref="/"
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
      </div>
    </>
  ),
};
