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
          icon={<MagnifyingGlassIcon />}
        />
        <XDSButton
          label="Notifications"
          variant="ghost"
          icon={<BellIcon />}
        />
        <XDSButton
          label="Profile"
          variant="ghost"
          icon={<UserCircleIcon />}
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
          <XDSNavIcon icon={<CubeIcon />} />
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
        icon={<UserCircleIcon />}
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
          <XDSNavIcon icon={<HomeIcon />} />
        }
      />
    ),
    endContent: <XDSButton label="Sign in" variant="primary" />,
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
            icon={<Cog6ToothIcon />}
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
            <XDSNavIcon icon={<CubeIcon />} />
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
            icon={<MagnifyingGlassIcon />}
          />
          <XDSButton
            label="Profile"
            variant="ghost"
            icon={<UserCircleIcon />}
          />
        </>
      }
    />
  ),
};

export const CenteredWithStartContent: Story = {
  render: () => (
    <XDSTopNav
      label="Main navigation"
      title={
        <XDSTopNavTitle
          title="Dashboard"
          logo={
            <XDSNavIcon
              icon={<ChartBarIcon />}
            />
          }
          href="#"
        />
      }
      startContent={
        <XDSTopNavItem
          label="Back"
          href="#"
          icon={<HomeIcon />}
        />
      }
      centerContent={
        <>
          <XDSTopNavItem label="Overview" href="#" isSelected />
          <XDSTopNavItem label="Analytics" href="#" />
          <XDSTopNavItem label="Reports" href="#" />
        </>
      }
      endContent={
        <XDSButton
          label="Profile"
          variant="ghost"
          icon={<UserCircleIcon />}
        />
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
          <XDSNavIcon icon={<CubeIcon />} />
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
              icon={<ChartBarIcon />}
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
            icon={<HomeIcon />}
          />
          <XDSTopNavItem
            label="Reports"
            href="#"
            icon={<DocumentTextIcon />}
          />
          <XDSTopNavItem
            label="Analytics"
            href="#"
            icon={<ChartBarIcon />}
          />
          <XDSTopNavItem
            label="Settings"
            href="#"
            icon={<Cog6ToothIcon />}
          />
        </>
      }
      endContent={
        <>
          <XDSButton
            label="Search"
            variant="ghost"
            icon={<MagnifyingGlassIcon />}
          />
          <XDSButton
            label="Notifications"
            variant="ghost"
            icon={<BellIcon />}
          />
          <XDSButton label="Upgrade" variant="primary" />
        </>
      }
    />
  ),
};
