import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSBanner} from '@xds/core/Banner';
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSText} from '@xds/core/Text';
import {XDSMobileNav} from '@xds/core/MobileNav';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {useMediaQuery} from '@xds/core/hooks';
import * as stylex from '@stylexjs/stylex';
import {
  HomeIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  UserGroupIcon,
  FolderIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  Bars3Icon,
  CubeIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  FolderIcon as FolderIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
} from '@heroicons/react/24/solid';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  longContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
  },
});

// =============================================================================
// Helpers
// =============================================================================

function MockContent({paragraphs = 3}: {paragraphs?: number}) {
  return (
    <>
      <XDSText type="large">Page Content</XDSText>
      <div {...stylex.props(styles.longContent)}>
        {Array.from({length: paragraphs}, (_, i) => (
          <XDSText type="body" key={i}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris.
          </XDSText>
        ))}
      </div>
    </>
  );
}

// =============================================================================
// Shared nav elements
// =============================================================================

/**
 * Standard TopNav used across multiple stories.
 * Provides app identity (logo + heading) and top-level navigation.
 */
function AppTopNav({endContent}: {endContent?: React.ReactNode}) {
  return (
    <XDSTopNav
      label="Main navigation"
      heading={
        <XDSTopNavHeading
          heading="Acme App"
          logo={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
        />
      }
      startContent={
        <>
          <XDSTopNavItem label="Home" href="#" isSelected />
          <XDSTopNavItem label="Products" href="#" />
          <XDSTopNavItem label="Docs" href="#" />
        </>
      }
      endContent={
        endContent ?? (
          <XDSButton
            label="Profile"
            variant="ghost"
            icon={<UserCircleIcon style={{width: 16, height: 16}} />}
            isIconOnly
          />
        )
      }
    />
  );
}

/**
 * SideNav WITHOUT header — for use alongside a TopNav.
 * The TopNav already displays the app name, so the SideNav omits its header
 * to avoid doubling the identity.
 */
function SideNavWithoutHeader() {
  return (
    <XDSSideNav>
      <XDSSideNavSection title="Main" isHeaderHidden>
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
          href="#"
        />
        <XDSSideNavItem
          label="Analytics"
          icon={ChartBarIcon}
          selectedIcon={ChartBarIconSolid}
          href="#"
        />
        <XDSSideNavItem
          label="Projects"
          icon={FolderIcon}
          selectedIcon={FolderIconSolid}
          href="#"
          endContent={<XDSBadge label={12} />}
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Organization">
        <XDSSideNavItem
          label="Team"
          icon={UserGroupIcon}
          selectedIcon={UserGroupIconSolid}
          href="#"
        />
        <XDSSideNavItem
          label="Settings"
          icon={Cog6ToothIcon}
          selectedIcon={Cog6ToothIconSolid}
          href="#"
        />
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

/**
 * SideNav WITH header — for standalone use without a TopNav.
 * The heading provides app identity (icon + heading) since there's no TopNav.
 */
function SideNavWithHeader() {
  return (
    <XDSSideNav
      header={
        <XDSSideNavHeading
          icon={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
          heading="Acme App"
          headingHref="#"
        />
      }>
      <XDSSideNavSection title="Main" isHeaderHidden>
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
          href="#"
        />
        <XDSSideNavItem
          label="Analytics"
          icon={ChartBarIcon}
          selectedIcon={ChartBarIconSolid}
          href="#"
        />
        <XDSSideNavItem
          label="Projects"
          icon={FolderIcon}
          selectedIcon={FolderIconSolid}
          href="#"
          endContent={<XDSBadge label={12} />}
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Organization">
        <XDSSideNavItem
          label="Team"
          icon={UserGroupIcon}
          selectedIcon={UserGroupIconSolid}
          href="#"
        />
        <XDSSideNavItem
          label="Settings"
          icon={Cog6ToothIcon}
          selectedIcon={Cog6ToothIconSolid}
          href="#"
        />
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

// =============================================================================
// Meta
// =============================================================================

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
    defaultIsSideNavCollapsed: {
      control: 'boolean',
      description: 'Whether the side nav starts collapsed',
    },

    background: {
      control: 'radio',
      options: ['surface', 'wash'],
      description: 'Background color of the shell',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSAppShell>;

// =============================================================================
// Playground (interactive controls)
// =============================================================================

/**
 * Interactive playground with controls for toggling top nav and side nav.
 * When top nav is turned off, the side nav automatically shows a header
 * with the app title since there's no top bar to display it.
 */
export const Playground: StoryObj<
  typeof XDSAppShell & {showTopNav: boolean; showSideNav: boolean}
> = {
  argTypes: {
    showTopNav: {
      control: 'boolean',
      description: 'Show the top navigation bar',
    },
    showSideNav: {
      control: 'boolean',
      description: 'Show the side navigation',
    },
    background: {
      control: 'radio',
      options: ['surface', 'wash'],
      description: 'Background color of the shell',
    },
    height: {
      control: 'radio',
      options: ['fill', 'auto'],
    },
  },
  args: {
    showTopNav: true,
    showSideNav: true,
    background: 'wash',
    height: 'fill',
  },
  render: function PlaygroundStory(args: {
    showTopNav: boolean;
    showSideNav: boolean;
    background: 'surface' | 'wash';
    height: 'fill' | 'auto';
  }) {
    return (
      <XDSAppShell
        contentPadding={6}
        topNav={args.showTopNav ? <AppTopNav /> : undefined}
        sideNav={
          args.showSideNav ? (
            args.showTopNav ? (
              <SideNavWithoutHeader />
            ) : (
              <SideNavWithHeader />
            )
          ) : undefined
        }
        background={args.background}
        height={args.height}>
        <MockContent />
      </XDSAppShell>
    );
  },
};

// =============================================================================
// Stories
// =============================================================================

/**
 * The most common layout: TopNav provides app identity, SideNav provides
 * page-level navigation. The SideNav omits its header to avoid doubling
 * the app name that's already in the TopNav.
 */
export const TopNavWithSideNav: Story = {
  render: () => (
    <XDSAppShell
      contentPadding={6}
      topNav={<AppTopNav />}
      sideNav={<SideNavWithoutHeader />}>
      <MockContent />
    </XDSAppShell>
  ),
};

/**
 * SideNav with its own heading (icon + heading) and no TopNav.
 * Use this layout for simpler apps where a full top bar isn't needed.
 * The SideNav header provides the app identity instead.
 */
export const SideNavOnly: Story = {
  render: () => (
    <XDSAppShell contentPadding={6} sideNav={<SideNavWithHeader />}>
      <MockContent />
    </XDSAppShell>
  ),
};

/**
 * TopNav with no side navigation. Suitable for landing pages,
 * simple apps, or pages that don't need secondary navigation.
 */
export const TopNavOnly: Story = {
  render: () => (
    <XDSAppShell contentPadding={6} topNav={<AppTopNav />}>
      <MockContent paragraphs={5} />
    </XDSAppShell>
  ),
};

/**
 * Kitchen sink: TopNav + SideNav with sections, nested items, badges,
 * footer icons, and a banner. Demonstrates all AppShell zones working
 * together.
 *
 * Note: The SideNav has no header because the TopNav already shows
 * the app identity.
 */
export const FullFeatured: Story = {
  render: () => (
    <XDSAppShell
      contentPadding={6}
      topNav={<AppTopNav />}
      sideNav={
        <XDSSideNav
          footerIcons={
            <>
              <XDSButton
                label="Help"
                variant="ghost"
                icon={
                  <QuestionMarkCircleIcon style={{width: 16, height: 16}} />
                }
                isIconOnly
              />
              <XDSButton
                label="Notifications"
                variant="ghost"
                icon={<BellIcon style={{width: 16, height: 16}} />}
                isIconOnly
              />
              <XDSButton
                label="Profile"
                variant="ghost"
                icon={<UserCircleIcon style={{width: 16, height: 16}} />}
                isIconOnly
              />
            </>
          }>
          <XDSSideNavSection title="Main" isHeaderHidden>
            <XDSSideNavItem
              label="Dashboard"
              icon={HomeIcon}
              selectedIcon={HomeIconSolid}
              isSelected
              href="#"
            />
            <XDSSideNavItem
              label="Analytics"
              icon={ChartBarIcon}
              selectedIcon={ChartBarIconSolid}
              href="#"
              endContent={<XDSBadge variant="info" label="New" />}
            />
            <XDSSideNavItem
              label="Projects"
              icon={FolderIcon}
              selectedIcon={FolderIconSolid}
              href="#"
              endContent={<XDSBadge label={12} />}
            />
          </XDSSideNavSection>
          <XDSSideNavSection title="Organization">
            <XDSSideNavItem
              label="Team"
              icon={UserGroupIcon}
              selectedIcon={UserGroupIconSolid}
              href="#"
            />
            <XDSSideNavItem
              label="Settings"
              icon={Cog6ToothIcon}
              selectedIcon={Cog6ToothIconSolid}
              href="#">
              <XDSSideNavItem label="General" href="#" />
              <XDSSideNavItem label="Security" href="#" />
              <XDSSideNavItem label="Integrations" href="#" />
            </XDSSideNavItem>
          </XDSSideNavSection>
          <XDSSideNavSection title="Resources">
            <XDSSideNavItem
              label="Documentation"
              icon={DocumentTextIcon}
              selectedIcon={DocumentTextIconSolid}
              href="#"
            />
            <XDSSideNavItem
              label="Compliance"
              icon={ShieldCheckIcon}
              selectedIcon={ShieldCheckIconSolid}
              href="#"
              isDisabled
            />
          </XDSSideNavSection>
        </XDSSideNav>
      }
      banner={
        <XDSBanner
          status="info"
          variant="section"
          title="System maintenance scheduled"
          description="The system will undergo maintenance tonight at 10pm UTC."
          isDismissable
        />
      }>
      <MockContent />
    </XDSAppShell>
  ),
};

/**
 * Auto height mode — the shell grows with content instead of filling
 * the viewport. Uses TopNav + SideNav (no SideNav header).
 */
export const AutoHeight: Story = {
  render: () => (
    <XDSAppShell
      contentPadding={6}
      topNav={<AppTopNav />}
      sideNav={<SideNavWithoutHeader />}
      height="auto">
      <MockContent paragraphs={20} />
    </XDSAppShell>
  ),
};

/**
 * Controlled collapse with external state.
 *
 * The toggle button lives in the TopNav but the collapse state lives in
 * AppShell. Pass `isSideNavCollapsed` and `onSideNavCollapsedChange` to
 * control the sidebar programmatically.
 */
export const ControlledCollapse: Story = {
  render: function ControlledCollapseStory() {
    const [collapsed, setCollapsed] = useState(false);
    return (
      <XDSAppShell
        contentPadding={6}
        topNav={
          <XDSTopNav
            label="Main navigation"
            heading={<XDSTopNavHeading heading="Acme App" />}
            endContent={
              <XDSButton
                label="Toggle sidebar"
                variant="ghost"
                icon={<Bars3Icon style={{width: 16, height: 16}} />}
                onClick={() => setCollapsed(!collapsed)}
                isIconOnly
              />
            }
          />
        }
        sideNav={<SideNavWithoutHeader />}
        isSideNavCollapsed={collapsed}
        onSideNavCollapsedChange={setCollapsed}>
        <MockContent />
      </XDSAppShell>
    );
  },
};

/**
 * No navigation at all — just content. Useful for full-bleed pages,
 * auth screens, or embedded views.
 */
export const ContentOnly: Story = {
  render: () => (
    <XDSAppShell contentPadding={6}>
      <MockContent paragraphs={5} />
    </XDSAppShell>
  ),
};

/**
 * Banner with TopNav + SideNav. Shows how the banner sits between
 * the TopNav and the content/sidenav area.
 */
export const WithBanner: Story = {
  render: () => (
    <XDSAppShell
      contentPadding={6}
      topNav={<AppTopNav />}
      sideNav={<SideNavWithoutHeader />}
      banner={
        <XDSBanner
          status="info"
          variant="section"
          title="System maintenance scheduled"
          description="The system will undergo maintenance tonight at 10pm UTC."
          isDismissable
        />
      }>
      <MockContent />
    </XDSAppShell>
  ),
};

/**
 * Responsive layout with mobile navigation drawer. Shows the recommended
 * pattern for apps that need to work across desktop and mobile:
 *
 * - Desktop (>768px): Standard AppShell with TopNav + inline SideNav
 * - Mobile (≤768px): SideNav hides, TopNav shows a hamburger button that
 *   opens the `mobileNav` drawer (an XDSMobileNav rendered by AppShell)
 *
 * The nav sections are defined once and shared between `sideNav` and
 * `mobileNav`. AppShell handles rendering the XDSMobileNav internally —
 * you just pass the content and control open/close state.
 *
 * Resize the viewport or use Storybook's viewport addon to see the
 * transition between layouts.
 */
export const WithMobileNav: Story = {
  name: 'With Mobile Nav',
  render: function WithMobileNavStory() {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const navSections = (
      <>
        <XDSSideNavSection title="Main" isHeaderHidden>
          <XDSSideNavItem
            label="Dashboard"
            icon={HomeIcon}
            selectedIcon={HomeIconSolid}
            isSelected
            href="#"
          />
          <XDSSideNavItem
            label="Analytics"
            icon={ChartBarIcon}
            selectedIcon={ChartBarIconSolid}
            href="#"
          />
          <XDSSideNavItem
            label="Projects"
            icon={FolderIcon}
            selectedIcon={FolderIconSolid}
            href="#"
            endContent={<XDSBadge label={12} />}
          />
        </XDSSideNavSection>
        <XDSSideNavSection title="Organization">
          <XDSSideNavItem
            label="Team"
            icon={UserGroupIcon}
            selectedIcon={UserGroupIconSolid}
            href="#"
          />
          <XDSSideNavItem
            label="Settings"
            icon={Cog6ToothIcon}
            selectedIcon={Cog6ToothIconSolid}
            href="#"
          />
        </XDSSideNavSection>
      </>
    );

    return (
      <XDSAppShell
        contentPadding={6}
        topNav={
          <XDSTopNav
            label="Main navigation"
            heading={
              <XDSTopNavHeading
                heading="Acme App"
                logo={
                  <XDSNavIcon
                    icon={<CubeIcon style={{width: 16, height: 16}} />}
                  />
                }
              />
            }
            startContent={
              isMobile ? (
                <XDSButton
                  label="Menu"
                  variant="ghost"
                  icon={<XDSIcon icon="menu" color="inherit" />}
                  onClick={() => setMobileNavOpen(true)}
                  isIconOnly
                />
              ) : (
                <>
                  <XDSTopNavItem label="Home" href="#" isSelected />
                  <XDSTopNavItem label="Products" href="#" />
                  <XDSTopNavItem label="Docs" href="#" />
                </>
              )
            }
            endContent={
              <>
                <XDSButton
                  label="Notifications"
                  variant="ghost"
                  icon={<BellIcon style={{width: 16, height: 16}} />}
                  isIconOnly
                />
                <XDSButton
                  label="Profile"
                  variant="ghost"
                  icon={<UserCircleIcon style={{width: 16, height: 16}} />}
                  isIconOnly
                />
              </>
            }
          />
        }
        sideNav={<XDSSideNav>{navSections}</XDSSideNav>}
        mobileNav={
          <XDSMobileNav
            isOpen={mobileNavOpen}
            onOpenChange={open => setMobileNavOpen(open)}
            title="Acme App">
            {navSections}
          </XDSMobileNav>
        }>
        <MockContent />
      </XDSAppShell>
    );
  },
};
