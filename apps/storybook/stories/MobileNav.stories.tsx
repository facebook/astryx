import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSMobileNav} from '@xds/core/MobileNav';
import {XDSBadge} from '@xds/core/Badge';
import {XDSText} from '@xds/core/Text';
import {
  XDSSideNav,
  XDSSideNavHeader,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {XDSTopNav, XDSTopNavTitle, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {useMediaQuery} from '@xds/core/hooks';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '@xds/core/theme/tokens.stylex';
import {
  HomeIcon,
  FolderIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  UserGroupIcon,
  CubeIcon,
  BellIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  FolderIcon as FolderIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  UserGroupIcon as UserGroupIconSolid,
} from '@heroicons/react/24/solid';

// =============================================================================
// Helpers
// =============================================================================

const contentStyles = stylex.create({
  content: {
    padding: spacingVars['--spacing-6'],
  },
});

function MockContent() {
  return (
    <div {...stylex.props(contentStyles.content)}>
      <XDSText type="large">Page Content</XDSText>
      <XDSText type="body">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </XDSText>
    </div>
  );
}

// =============================================================================
// Meta
// =============================================================================

const meta: Meta<typeof XDSMobileNav> = {
  title: 'Navigation/XDSMobileNav',
  component: XDSMobileNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof XDSMobileNav>;

// =============================================================================
// Default
// =============================================================================

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <XDSButton
          label="Open Navigation"
          icon={<XDSIcon icon="menu" color="inherit" />}
          variant="ghost"
          onClick={() => setIsOpen(true)}
        />
        <XDSMobileNav
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Navigation">
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
          <XDSSideNavSection title="Settings">
            <XDSSideNavItem
              label="General"
              icon={Cog6ToothIcon}
              href="/settings"
            />
            <XDSSideNavItem label="Team" icon={UserGroupIcon} href="/team" />
          </XDSSideNavSection>
        </XDSMobileNav>
      </>
    );
  },
};

// =============================================================================
// With SideNav Children
// =============================================================================

export const WithSideNavChildren: Story = {
  name: 'With SideNav Children',
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    const navSections = (
      <>
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
        <XDSSideNavSection title="Settings">
          <XDSSideNavItem
            label="General"
            icon={Cog6ToothIcon}
            href="/settings"
          />
        </XDSSideNavSection>
      </>
    );

    return (
      <>
        <XDSButton label="Open Drawer" onClick={() => setIsOpen(true)} />
        <XDSMobileNav
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="My App">
          {navSections}
        </XDSMobileNav>
      </>
    );
  },
};

// =============================================================================
// Responsive Pattern
// =============================================================================

export const ResponsivePattern: Story = {
  name: 'Responsive Pattern',
  render: () => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [drawerOpen, setDrawerOpen] = useState(false);

    const navSections = (
      <>
        <XDSSideNavSection title="Main">
          <XDSSideNavItem
            label="Dashboard"
            icon={HomeIcon}
            selectedIcon={HomeIconSolid}
            isSelected
            href="/"
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
        <XDSSideNavSection title="Settings">
          <XDSSideNavItem
            label="General"
            icon={Cog6ToothIcon}
            href="/settings"
          />
          <XDSSideNavItem label="Team" icon={UserGroupIcon} href="/team" />
        </XDSSideNavSection>
      </>
    );

    if (isMobile) {
      return (
        <>
          <XDSButton
            label="Menu"
            icon={<XDSIcon icon="menu" color="inherit" />}
            variant="ghost"
            onClick={() => setDrawerOpen(true)}
          />
          <XDSMobileNav
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            title="My App">
            {navSections}
          </XDSMobileNav>
        </>
      );
    }

    return (
      <div style={{width: 280, height: 600, border: '1px solid #e5e7eb'}}>
        <XDSSideNav
          header={
            <XDSSideNavHeader
              icon={
                <XDSNavIcon
                  icon={<CubeIcon style={{width: 16, height: 16}} />}
                />
              }
              title="My App"
              titleHref="/"
            />
          }>
          {navSections}
        </XDSSideNav>
      </div>
    );
  },
};

// =============================================================================
// End Side
// =============================================================================

export const EndSide: Story = {
  name: 'End Side',
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <XDSButton label="Open from Right" onClick={() => setIsOpen(true)} />
        <XDSMobileNav
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Settings"
          side="end">
          <XDSSideNavSection title="Settings">
            <XDSSideNavItem
              label="General"
              icon={Cog6ToothIcon}
              href="/settings"
            />
            <XDSSideNavItem label="Team" icon={UserGroupIcon} href="/team" />
          </XDSSideNavSection>
        </XDSMobileNav>
      </>
    );
  },
};

// =============================================================================
// Custom Width
// =============================================================================

export const CustomWidth: Story = {
  name: 'Custom Width',
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <XDSButton label="Open Wide Drawer" onClick={() => setIsOpen(true)} />
        <XDSMobileNav
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Wide Navigation"
          width={360}>
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
              href="/projects"
            />
          </XDSSideNavSection>
        </XDSMobileNav>
      </>
    );
  },
};

// =============================================================================
// Without Title
// =============================================================================

export const WithoutTitle: Story = {
  name: 'Without Title',
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <XDSButton
          label="Open Navigation"
          icon={<XDSIcon icon="menu" color="inherit" />}
          variant="ghost"
          onClick={() => setIsOpen(true)}
        />
        <XDSMobileNav isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <XDSSideNavSection title="Main">
            <XDSSideNavItem
              label="Dashboard"
              icon={HomeIcon}
              isSelected
              href="/dashboard"
            />
            <XDSSideNavItem
              label="Projects"
              icon={FolderIcon}
              href="/projects"
            />
          </XDSSideNavSection>
        </XDSMobileNav>
      </>
    );
  },
};

// =============================================================================
// Full App Shell Pattern
// =============================================================================

/**
 * The recommended responsive pattern: SideNav on desktop, MobileNav drawer on
 * mobile, all within an AppShell. This is the complete picture showing how
 * XDSMobileNav integrates with the other navigation components.
 *
 * - Desktop (>768px): TopNav + inline SideNav
 * - Mobile (≤768px): TopNav with hamburger button → MobileNav drawer
 *
 * Nav sections are defined once and shared between both layouts.
 * Resize the viewport to see the transition.
 */
export const FullAppShellPattern: Story = {
  name: 'Full App Shell Pattern',
  parameters: {
    layout: 'fullscreen',
  },
  render: function FullAppShellPatternStory() {
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
            endContent={<XDSBadge>12</XDSBadge>}
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
        topNav={
          <XDSTopNav
            label="Main navigation"
            title={
              <XDSTopNavTitle
                title="Acme App"
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
                />
                <XDSButton
                  label="Profile"
                  variant="ghost"
                  icon={<UserCircleIcon style={{width: 16, height: 16}} />}
                />
              </>
            }
          />
        }
        sideNav={<XDSSideNav>{navSections}</XDSSideNav>}
        mobileNav={
          <XDSMobileNav
            isOpen={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
            title="Acme App">
            {navSections}
          </XDSMobileNav>
        }>
        <MockContent />
      </XDSAppShell>
    );
  },
};
