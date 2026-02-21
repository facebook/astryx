import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';
import {XDSTopNav, XDSTopNavTitle, XDSTopNavItem} from '@xds/core/TopNav';
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars} from '@xds/core/theme/tokens.stylex';
import {
  HomeIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  UserCircleIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

const styles = stylex.create({
  pageNav: {
    padding: spacingVars['--spacing-4'],
  },
  navItem: {
    display: 'block',
    padding: `${spacingVars['--spacing-2']} ${spacingVars['--spacing-3']}`,
    borderRadius: 6,
    cursor: 'pointer',
    color: colorVars['--color-text-primary'],
    fontSize: 14,
    textDecoration: 'none',
    backgroundColor: {
      default: 'transparent',
      ':hover': colorVars['--color-hover-overlay'],
    },
  },
  navItemActive: {
    backgroundColor: colorVars['--color-accent-deemphasized'],
    color: colorVars['--color-accent-text'],
  },
  content: {
    padding: spacingVars['--spacing-6'],
  },
  banner: {
    padding: `${spacingVars['--spacing-2']} ${spacingVars['--spacing-4']}`,
    backgroundColor: colorVars['--color-blue-background'],
    color: colorVars['--color-blue-text'],
    fontSize: 13,
  },
  longContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
  },
});

function MockPageNav() {
  return (
    <div {...stylex.props(styles.pageNav)}>
      <a {...stylex.props(styles.navItem, styles.navItemActive)}>Dashboard</a>
      <a {...stylex.props(styles.navItem)}>Analytics</a>
      <a {...stylex.props(styles.navItem)}>Settings</a>
      <a {...stylex.props(styles.navItem)}>Users</a>
      <a {...stylex.props(styles.navItem)}>Reports</a>
    </div>
  );
}

function MockContent({paragraphs = 3}: {paragraphs?: number}) {
  return (
    <div {...stylex.props(styles.content)}>
      <XDSText type="large">Page Content</XDSText>
      <div {...stylex.props(styles.longContent)}>
        {Array.from({length: paragraphs}, (_, i) => (
          <XDSText key={i}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris.
          </XDSText>
        ))}
      </div>
    </div>
  );
}

const meta: Meta<typeof XDSAppShell> = {
  title: 'Core/XDSAppShell',
  component: XDSAppShell,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    height: {
      control: 'radio',
      options: ['fill', 'auto'],
    },
    sideNavBreakpoint: {
      control: 'radio',
      options: ['sm', 'md', 'lg', 'none'],
    },
    sideNavWidth: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSAppShell>;

export const Default: Story = {
  render: () => (
    <XDSAppShell
      topNav={
        <XDSTopNav
          label="Main navigation"
          title={<XDSTopNavTitle title="My App" />}
          startContent={
            <>
              <XDSTopNavItem label="Home" href="#" isSelected />
              <XDSTopNavItem label="Products" href="#" />
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
      }
      sideNav={<MockPageNav />}>
      <MockContent />
    </XDSAppShell>
  ),
};

export const HeaderOnly: Story = {
  render: () => (
    <XDSAppShell
      topNav={
        <XDSTopNav
          label="Main navigation"
          title={<XDSTopNavTitle title="Landing Page" />}
        />
      }>
      <MockContent paragraphs={5} />
    </XDSAppShell>
  ),
};

export const WithBanner: Story = {
  render: () => (
    <XDSAppShell
      topNav={
        <XDSTopNav
          label="Main navigation"
          title={<XDSTopNavTitle title="My App" />}
          startContent={
            <>
              <XDSTopNavItem label="Home" href="#" isSelected />
              <XDSTopNavItem label="Products" href="#" />
            </>
          }
        />
      }
      sideNav={<MockPageNav />}
      banner={
        // TODO: Replace with <XDSBanner> once the Banner component is available
        <div {...stylex.props(styles.banner)}>
          ℹ️ System maintenance scheduled for tonight at 10pm UTC.
        </div>
      }>
      <MockContent />
    </XDSAppShell>
  ),
};

export const AutoHeight: Story = {
  render: () => (
    <XDSAppShell
      topNav={
        <XDSTopNav
          label="Main navigation"
          title={<XDSTopNavTitle title="Documentation" />}
          startContent={
            <>
              <XDSTopNavItem
                label="Docs"
                href="#"
                isSelected
                icon={<HomeIcon style={{width: 16, height: 16}} />}
              />
              <XDSTopNavItem
                label="API"
                href="#"
                icon={<ChartBarIcon style={{width: 16, height: 16}} />}
              />
            </>
          }
        />
      }
      sideNav={<MockPageNav />}
      height="auto">
      <MockContent paragraphs={20} />
    </XDSAppShell>
  ),
};

/**
 * Controlled collapse with external state.
 *
 * NOTE: Collapse controls require coordination between the shell and nav —
 * the toggle button lives in the topNav but the collapse state lives in
 * AppShell. This is a known design tension. For now, the toggle is passed
 * as endContent in the topNav.
 */
export const ControlledCollapse: Story = {
  render: function ControlledCollapseStory() {
    const [collapsed, setCollapsed] = useState(false);
    return (
      <XDSAppShell
        topNav={
          <XDSTopNav
            label="Main navigation"
            title={<XDSTopNavTitle title="Controlled" />}
            endContent={
              <XDSButton
                label="Toggle sidebar"
                variant="ghost"
                icon={<Bars3Icon style={{width: 16, height: 16}} />}
                onClick={() => setCollapsed(!collapsed)}
              />
            }
          />
        }
        sideNav={<MockPageNav />}
        isSideNavCollapsed={collapsed}
        onSideNavCollapsedChange={setCollapsed}>
        <MockContent />
      </XDSAppShell>
    );
  },
};

export const InitiallyCollapsed: Story = {
  render: () => (
    <XDSAppShell
      topNav={
        <XDSTopNav
          label="Main navigation"
          title={<XDSTopNavTitle title="Collapsed" />}
        />
      }
      sideNav={<MockPageNav />}
      initialIsSideNavCollapsed={true}>
      <MockContent />
    </XDSAppShell>
  ),
};

export const CustomSideNavWidth: Story = {
  render: () => (
    <XDSAppShell
      topNav={
        <XDSTopNav
          label="Main navigation"
          title={<XDSTopNavTitle title="Wide SideNav" />}
          startContent={
            <>
              <XDSTopNavItem
                label="Settings"
                href="#"
                isSelected
                icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
              />
            </>
          }
        />
      }
      sideNav={<MockPageNav />}
      sideNavWidth={320}>
      <MockContent />
    </XDSAppShell>
  ),
};

export const ContentOnly: Story = {
  render: () => (
    <XDSAppShell>
      <MockContent paragraphs={5} />
    </XDSAppShell>
  ),
};
