import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSMobileNav} from '@xds/core/MobileNav';
import {
  XDSSideNav,
  XDSSideNavHeader,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {useMediaQuery} from '@xds/core/hooks';
import {
  HomeIcon,
  FolderIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  UserGroupIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  FolderIcon as FolderIconSolid,
} from '@heroicons/react/24/solid';

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
          onOpenChange={open => setIsOpen(open)}
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
          onOpenChange={open => setIsOpen(open)}
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
            onOpenChange={open => setDrawerOpen(open)}
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
          onOpenChange={open => setIsOpen(open)}
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
          onOpenChange={open => setIsOpen(open)}
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
        <XDSMobileNav isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
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
