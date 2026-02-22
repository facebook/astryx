import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSTopNav,
  XDSTopNavTitle,
  XDSTopNavTitleIcon,
  XDSTopNavItem,
} from '@xds/core/TopNav';
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
          <XDSTopNavTitleIcon
            icon={<CubeIcon style={{width: 16, height: 16}} />}
          />
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
          <XDSTopNavTitleIcon
            icon={<HomeIcon style={{width: 16, height: 16}} />}
            size="sm"
          />
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
            icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
          />
        </>
      }
    />
  ),
};

export const TitleIconSizes: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <XDSTopNav
        label="Small icon"
        title={
          <XDSTopNavTitle
            title="Small"
            logo={
              <XDSTopNavTitleIcon
                icon={<CubeIcon style={{width: 14, height: 14}} />}
                size="sm"
              />
            }
          />
        }
      />
      <XDSTopNav
        label="Medium icon"
        title={
          <XDSTopNavTitle
            title="Medium"
            logo={
              <XDSTopNavTitleIcon
                icon={<CubeIcon style={{width: 16, height: 16}} />}
                size="md"
              />
            }
          />
        }
      />
      <XDSTopNav
        label="Large icon"
        title={
          <XDSTopNavTitle
            title="Large"
            logo={
              <XDSTopNavTitleIcon
                icon={<CubeIcon style={{width: 18, height: 18}} />}
                size="lg"
              />
            }
          />
        }
      />
    </div>
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
            <XDSTopNavTitleIcon
              icon={<CubeIcon style={{width: 16, height: 16}} />}
            />
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

export const CenteredWithStartContent: Story = {
  render: () => (
    <XDSTopNav
      label="Main navigation"
      title={
        <XDSTopNavTitle
          title="Dashboard"
          logo={
            <XDSTopNavTitleIcon
              icon={<ChartBarIcon style={{width: 16, height: 16}} />}
            />
          }
          href="#"
        />
      }
      startContent={
        <XDSTopNavItem
          label="Back"
          href="#"
          icon={<HomeIcon style={{width: 16, height: 16}} />}
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
          icon={<UserCircleIcon style={{width: 16, height: 16}} />}
        />
      }
    />
  ),
};

export const FullExample: Story = {
  render: () => (
    <XDSTopNav
      label="Main navigation"
      title={
        <XDSTopNavTitle
          title="Enterprise Dashboard"
          logo={
            <XDSTopNavTitleIcon
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
