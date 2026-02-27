import type {Meta, StoryObj} from '@storybook/react';
import {XDSTopNav, XDSTopNavTitle, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSButton} from '@xds/core/Button';
import {
  HomeIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  CubeIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const meta: Meta<typeof XDSTopNav> = {
  title: 'Navigation/XDSTopNav',
  component: XDSTopNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible label for navigation landmark',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSTopNav>;

export const Default: Story = {
  args: {
    label: 'Main navigation',
    title: <XDSTopNavTitle title="My App" />,
    startContent: (
      <>
        <XDSTopNavItem label="Home" href="#" isSelected />
        <XDSTopNavItem label="Products" href="#" />
        <XDSTopNavItem label="About" href="#" />
      </>
    ),
    endContent: (
      <>
        <XDSButton
          label="Search"
          variant="ghost"
          icon={<MagnifyingGlassIcon style={{width: 16, height: 16}} />}
        />
        <XDSButton
          label="Notifications"
          variant="ghost"
          icon={<BellIcon style={{width: 16, height: 16}} />}
        />
        <XDSButton
          label="Profile"
          variant="ghost"
          icon={<UserCircleIcon style={{width: 16, height: 16}} />}
        />
      </>
    ),
  },
};

export const WithLogo: Story = {
  args: {
    label: 'Main navigation',
    title: (
      <XDSTopNavTitle
        title="Dashboard"
        logo={
          <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
        }
        href="#"
      />
    ),
    startContent: (
      <>
        <XDSTopNavItem label="Overview" href="#" isSelected />
        <XDSTopNavItem label="Analytics" href="#" />
        <XDSTopNavItem label="Reports" href="#" />
      </>
    ),
    endContent: (
      <XDSButton
        label="Profile"
        variant="ghost"
        icon={<UserCircleIcon style={{width: 16, height: 16}} />}
      />
    ),
  },
};

export const TitleOnly: Story = {
  args: {
    label: 'Main navigation',
    title: (
      <XDSTopNavTitle
        title="Simple App"
        logo={
          <XDSNavIcon icon={<HomeIcon style={{width: 16, height: 16}} />} />
        }
      />
    ),
    endContent: <XDSButton label="Sign in" variant="primary" />,
  },
};

/**
 * Suite branding — `suiteName` renders above the title in smaller,
 * secondary text. Use when the app belongs to a product suite.
 */
export const WithSuiteName: Story = {
  args: {
    label: 'Main navigation',
    title: (
      <XDSTopNavTitle
        suiteName="Acme Suite"
        title="Analytics"
        logo={
          <XDSNavIcon icon={<ChartBarIcon style={{width: 16, height: 16}} />} />
        }
        href="#"
      />
    ),
    startContent: (
      <>
        <XDSTopNavItem label="Overview" href="#" isSelected />
        <XDSTopNavItem label="Reports" href="#" />
      </>
    ),
  },
};

/**
 * Subtitle context — `subtitle` renders below the title in smaller,
 * secondary text. Use for account names, workspace context, etc.
 */
export const WithSubtitle: Story = {
  args: {
    label: 'Main navigation',
    title: (
      <XDSTopNavTitle
        title="Dashboard"
        subtitle="Business Account"
        logo={
          <XDSNavIcon icon={<HomeIcon style={{width: 16, height: 16}} />} />
        }
        href="#"
      />
    ),
    startContent: (
      <>
        <XDSTopNavItem label="Overview" href="#" isSelected />
        <XDSTopNavItem label="Settings" href="#" />
      </>
    ),
  },
};

export const NavItemStates: Story = {
  render: () => (
    <XDSTopNav
      label="Navigation states demo"
      title={<XDSTopNavTitle title="States" />}
      startContent={
        <>
          <XDSTopNavItem label="Selected" href="#" isSelected />
          <XDSTopNavItem label="Default" href="#" />
          <XDSTopNavItem label="Disabled" href="#" isDisabled />
          <XDSTopNavItem
            label="With Icon"
            href="#"
            icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
          />
        </>
      }
    />
  ),
};

export const CenteredNavigation: Story = {
  render: () => (
    <XDSTopNav
      label="Main navigation"
      title={
        <XDSTopNavTitle
          title="My App"
          logo={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
          href="#"
        />
      }
      centerContent={
        <>
          <XDSTopNavItem label="Home" href="#" isSelected />
          <XDSTopNavItem label="Products" href="#" />
          <XDSTopNavItem label="About" href="#" />
        </>
      }
      endContent={
        <>
          <XDSButton
            label="Search"
            variant="ghost"
            icon={<MagnifyingGlassIcon style={{width: 16, height: 16}} />}
          />
          <XDSButton
            label="Profile"
            variant="ghost"
            icon={<UserCircleIcon style={{width: 16, height: 16}} />}
          />
        </>
      }
    />
  ),
};

export const CenterContentWithoutEnd: Story = {
  args: {
    label: 'Main navigation',
    title: (
      <XDSTopNavTitle
        title="My App"
        logo={
          <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
        }
        href="#"
      />
    ),
    centerContent: (
      <>
        <XDSTopNavItem label="Home" href="#" isSelected />
        <XDSTopNavItem label="Products" href="#" />
      </>
    ),
  },
};

export const FullExample: Story = {
  render: () => (
    <XDSTopNav
      label="Main navigation"
      title={
        <XDSTopNavTitle
          title="Enterprise Dashboard"
          logo={
            <XDSNavIcon
              icon={<ChartBarIcon style={{width: 16, height: 16}} />}
            />
          }
          href="#"
        />
      }
      startContent={
        <>
          <XDSTopNavItem
            label="Dashboard"
            href="#"
            isSelected
            icon={<HomeIcon style={{width: 16, height: 16}} />}
          />
          <XDSTopNavItem
            label="Reports"
            href="#"
            icon={<DocumentTextIcon style={{width: 16, height: 16}} />}
          />
          <XDSTopNavItem
            label="Analytics"
            href="#"
            icon={<ChartBarIcon style={{width: 16, height: 16}} />}
          />
          <XDSTopNavItem
            label="Settings"
            href="#"
            icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
          />
        </>
      }
      endContent={
        <>
          <XDSButton
            label="Search"
            variant="ghost"
            icon={<MagnifyingGlassIcon style={{width: 16, height: 16}} />}
          />
          <XDSButton
            label="Notifications"
            variant="ghost"
            icon={<BellIcon style={{width: 16, height: 16}} />}
          />
          <XDSButton label="Upgrade" variant="primary" />
        </>
      }
    />
  ),
};
