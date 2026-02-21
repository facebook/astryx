import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  typographyVars,
} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  topNav: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: `${spacingVars['--spacing-3']} ${spacingVars['--spacing-4']}`,
    borderBlockEndWidth: 1,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colorVars['--color-divider'],
    backgroundColor: colorVars['--color-surface'],
    fontFamily: typographyVars['--font-body'],
  },
  topNavTitle: {
    fontWeight: 600,
    fontSize: 16,
    color: colorVars['--color-text-primary'],
  },
  pageNav: {
    padding: spacingVars['--spacing-4'],
    fontFamily: typographyVars['--font-body'],
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
    fontFamily: typographyVars['--font-body'],
  },
  banner: {
    padding: `${spacingVars['--spacing-2']} ${spacingVars['--spacing-4']}`,
    backgroundColor: colorVars['--color-blue-background'],
    color: colorVars['--color-blue-text'],
    fontSize: 13,
    fontFamily: typographyVars['--font-body'],
  },
  longContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
  },
});

function MockTopNav({
  title,
  onToggleSidebar,
}: {
  title: string;
  onToggleSidebar?: () => void;
}) {
  return (
    <div {...stylex.props(styles.topNav)}>
      {onToggleSidebar && (
        <XDSButton
          variant="chromeless"
          size="sm"
          label="Toggle sidebar"
          onClick={onToggleSidebar}
        />
      )}
      <span {...stylex.props(styles.topNavTitle)}>{title}</span>
    </div>
  );
}

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
    sidebarBreakpoint: {
      control: 'radio',
      options: ['sm', 'md', 'lg', 'none'],
    },
    sidebarWidth: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSAppShell>;

export const Default: Story = {
  render: () => (
    <XDSAppShell
      topNav={<MockTopNav title="My App" />}
      pageNav={<MockPageNav />}>
      <MockContent />
    </XDSAppShell>
  ),
};

export const HeaderOnly: Story = {
  render: () => (
    <XDSAppShell topNav={<MockTopNav title="Landing Page" />}>
      <MockContent paragraphs={5} />
    </XDSAppShell>
  ),
};

export const WithBanner: Story = {
  render: () => (
    <XDSAppShell
      topNav={<MockTopNav title="My App" />}
      pageNav={<MockPageNav />}
      topBanner={
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
      topNav={<MockTopNav title="Documentation" />}
      pageNav={<MockPageNav />}
      height="auto">
      <MockContent paragraphs={20} />
    </XDSAppShell>
  ),
};

export const ControlledCollapse: Story = {
  render: function ControlledCollapseStory() {
    const [collapsed, setCollapsed] = useState(false);
    return (
      <XDSAppShell
        topNav={
          <MockTopNav
            title="Controlled"
            onToggleSidebar={() => setCollapsed(!collapsed)}
          />
        }
        pageNav={<MockPageNav />}
        isSidebarCollapsed={collapsed}
        onSidebarCollapsedChange={setCollapsed}>
        <MockContent />
      </XDSAppShell>
    );
  },
};

export const InitiallyCollapsed: Story = {
  render: () => (
    <XDSAppShell
      topNav={<MockTopNav title="Collapsed" />}
      pageNav={<MockPageNav />}
      initialIsSidebarCollapsed={true}>
      <MockContent />
    </XDSAppShell>
  ),
};

export const CustomSidebarWidth: Story = {
  render: () => (
    <XDSAppShell
      topNav={<MockTopNav title="Wide Sidebar" />}
      pageNav={<MockPageNav />}
      sidebarWidth={320}>
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
