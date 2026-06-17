// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {AppShell} from '@xds/core/AppShell';
import {Banner} from '@xds/core/Banner';
import {Badge} from '@xds/core/Badge';
import {Button} from '@xds/core/Button';
import {Icon} from '@xds/core/Icon';
import {Text} from '@xds/core/Text';
import {MobileNav} from '@xds/core/MobileNav';
import {TopNav, TopNavHeading, TopNavItem} from '@xds/core/TopNav';
import {NavIcon} from '@xds/core/NavIcon';
import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
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
      <Text type="large">Page Content</Text>
      <div {...stylex.props(styles.longContent)}>
        {Array.from({length: paragraphs}, (_, i) => (
          <Text type="body" key={i}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris.
          </Text>
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
    <TopNav
      label="Main navigation"
      heading={
        <TopNavHeading
          heading="Acme App"
          logo={
            <NavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
        />
      }
      startContent={
        <>
          <TopNavItem label="Home" href="#" isSelected />
          <TopNavItem label="Products" href="#" />
          <TopNavItem label="Docs" href="#" />
        </>
      }
      endContent={
        endContent ?? (
          <Button
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
    <SideNav>
      <SideNavSection title="Main" isHeaderHidden>
        <SideNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
          href="#"
        />
        <SideNavItem
          label="Analytics"
          icon={ChartBarIcon}
          selectedIcon={ChartBarIconSolid}
          href="#"
        />
        <SideNavItem
          label="Projects"
          icon={FolderIcon}
          selectedIcon={FolderIconSolid}
          href="#"
          endContent={<Badge label={12} />}
        />
      </SideNavSection>
      <SideNavSection title="Organization">
        <SideNavItem
          label="Team"
          icon={UserGroupIcon}
          selectedIcon={UserGroupIconSolid}
          href="#"
        />
        <SideNavItem
          label="Settings"
          icon={Cog6ToothIcon}
          selectedIcon={Cog6ToothIconSolid}
          href="#"
        />
      </SideNavSection>
    </SideNav>
  );
}

/**
 * SideNav WITH header — for standalone use without a TopNav.
 * The heading provides app identity (icon + heading) since there's no TopNav.
 */
function SideNavWithHeader() {
  return (
    <SideNav
      header={
        <SideNavHeading
          icon={
            <NavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
          heading="Acme App"
          headingHref="#"
        />
      }>
      <SideNavSection title="Main" isHeaderHidden>
        <SideNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
          href="#"
        />
        <SideNavItem
          label="Analytics"
          icon={ChartBarIcon}
          selectedIcon={ChartBarIconSolid}
          href="#"
        />
        <SideNavItem
          label="Projects"
          icon={FolderIcon}
          selectedIcon={FolderIconSolid}
          href="#"
          endContent={<Badge label={12} />}
        />
      </SideNavSection>
      <SideNavSection title="Organization">
        <SideNavItem
          label="Team"
          icon={UserGroupIcon}
          selectedIcon={UserGroupIconSolid}
          href="#"
        />
        <SideNavItem
          label="Settings"
          icon={Cog6ToothIcon}
          selectedIcon={Cog6ToothIconSolid}
          href="#"
        />
      </SideNavSection>
    </SideNav>
  );
}

// =============================================================================
// Meta
// =============================================================================

const meta: Meta<typeof AppShell> = {
  title: 'Core/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    height: {
      control: 'radio',
      options: ['fill', 'auto'],
    },
    variant: {
      control: 'radio',
      options: ['wash', 'surface', 'section', 'elevated'],
      description: 'Navigation background style',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppShell>;

// =============================================================================
// Playground (interactive controls)
// =============================================================================

/**
 * Interactive playground with controls for toggling top nav and side nav.
 * When top nav is turned off, the side nav automatically shows a header
 * with the app title since there's no top bar to display it.
 */
export const Playground: StoryObj<typeof AppShell> = {
  argTypes: {
    variant: {
      control: 'radio',
      options: ['wash', 'surface', 'section', 'elevated'],
      description: 'Navigation background style',
    },
    height: {
      control: 'radio',
      options: ['fill', 'auto'],
    },
  },
  args: {
    variant: 'elevated',
    height: 'fill',
  },
  render: function PlaygroundStory(args) {
    return (
      <AppShell
        contentPadding={6}
        topNav={<AppTopNav />}
        sideNav={<SideNavWithoutHeader />}
        variant={args.variant}
        height={args.height}>
        <MockContent />
      </AppShell>
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
    <AppShell
      contentPadding={6}
      topNav={<AppTopNav />}
      sideNav={<SideNavWithoutHeader />}>
      <MockContent />
    </AppShell>
  ),
};

/**
 * SideNav with its own heading (icon + heading) and no TopNav.
 * Use this layout for simpler apps where a full top bar isn't needed.
 * The SideNav header provides the app identity instead.
 */
export const SideNavOnly: Story = {
  render: () => (
    <AppShell contentPadding={6} sideNav={<SideNavWithHeader />}>
      <MockContent />
    </AppShell>
  ),
};

/**
 * TopNav with no side navigation. Suitable for landing pages,
 * simple apps, or pages that don't need secondary navigation.
 */
export const TopNavOnly: Story = {
  render: () => (
    <AppShell contentPadding={6} topNav={<AppTopNav />}>
      <MockContent paragraphs={5} />
    </AppShell>
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
    <AppShell
      contentPadding={6}
      topNav={<AppTopNav />}
      sideNav={
        <SideNav
          footerIcons={
            <>
              <Button
                label="Help"
                variant="ghost"
                icon={
                  <QuestionMarkCircleIcon style={{width: 16, height: 16}} />
                }
                isIconOnly
              />
              <Button
                label="Notifications"
                variant="ghost"
                icon={<BellIcon style={{width: 16, height: 16}} />}
                isIconOnly
              />
              <Button
                label="Profile"
                variant="ghost"
                icon={<UserCircleIcon style={{width: 16, height: 16}} />}
                isIconOnly
              />
            </>
          }>
          <SideNavSection title="Main" isHeaderHidden>
            <SideNavItem
              label="Dashboard"
              icon={HomeIcon}
              selectedIcon={HomeIconSolid}
              isSelected
              href="#"
            />
            <SideNavItem
              label="Analytics"
              icon={ChartBarIcon}
              selectedIcon={ChartBarIconSolid}
              href="#"
              endContent={<Badge variant="info" label="New" />}
            />
            <SideNavItem
              label="Projects"
              icon={FolderIcon}
              selectedIcon={FolderIconSolid}
              href="#"
              endContent={<Badge label={12} />}
            />
          </SideNavSection>
          <SideNavSection title="Organization">
            <SideNavItem
              label="Team"
              icon={UserGroupIcon}
              selectedIcon={UserGroupIconSolid}
              href="#"
            />
            <SideNavItem
              label="Settings"
              icon={Cog6ToothIcon}
              selectedIcon={Cog6ToothIconSolid}
              href="#">
              <SideNavItem label="General" href="#" />
              <SideNavItem label="Security" href="#" />
              <SideNavItem label="Integrations" href="#" />
            </SideNavItem>
          </SideNavSection>
          <SideNavSection title="Resources">
            <SideNavItem
              label="Documentation"
              icon={DocumentTextIcon}
              selectedIcon={DocumentTextIconSolid}
              href="#"
            />
            <SideNavItem
              label="Compliance"
              icon={ShieldCheckIcon}
              selectedIcon={ShieldCheckIconSolid}
              href="#"
              isDisabled
            />
          </SideNavSection>
        </SideNav>
      }
      banner={
        <Banner
          status="info"
          container="section"
          title="System maintenance scheduled"
          description="The system will undergo maintenance tonight at 10pm UTC."
          isDismissable
        />
      }>
      <MockContent />
    </AppShell>
  ),
};

/**
 * Auto height mode — the shell grows with content instead of filling
 * the viewport. Uses TopNav + SideNav (no SideNav header).
 */
export const AutoHeight: Story = {
  render: () => (
    <AppShell
      contentPadding={6}
      topNav={<AppTopNav />}
      sideNav={<SideNavWithoutHeader />}
      height="auto">
      <MockContent paragraphs={20} />
    </AppShell>
  ),
};

/**
 * Controlled collapse with external state.
 *
 * The toggle button lives in the TopNav. The sidebar auto-collapses
 * at the configured breakpoint. AppShell handles collapse and mobile
 * overlay internally based on viewport size.
 */
export const ControlledCollapse: Story = {
  render: function ControlledCollapseStory() {
    return (
      <AppShell
        contentPadding={6}
        topNav={
          <TopNav
            label="Main navigation"
            heading={<TopNavHeading heading="Acme App" />}
            endContent={
              <Button
                label="Toggle sidebar"
                variant="ghost"
                icon={<Bars3Icon style={{width: 16, height: 16}} />}
                isIconOnly
              />
            }
          />
        }
        sideNav={<SideNavWithoutHeader />}>
        <MockContent />
      </AppShell>
    );
  },
};

/**
 * No navigation at all — just content. Useful for full-bleed pages,
 * auth screens, or embedded views.
 */
export const ContentOnly: Story = {
  render: () => (
    <AppShell contentPadding={6}>
      <MockContent paragraphs={5} />
    </AppShell>
  ),
};

/**
 * Banner with TopNav + SideNav. Shows how the banner sits between
 * the TopNav and the content/sidenav area.
 */
export const WithBanner: Story = {
  render: () => (
    <AppShell
      contentPadding={6}
      topNav={<AppTopNav />}
      sideNav={<SideNavWithoutHeader />}
      banner={
        <Banner
          status="info"
          container="section"
          title="System maintenance scheduled"
          description="The system will undergo maintenance tonight at 10pm UTC."
          isDismissable
        />
      }>
      <MockContent />
    </AppShell>
  ),
};

/**
 * Responsive layout with mobile navigation drawer. Shows the recommended
 * pattern for apps that need to work across desktop and mobile:
 *
 * - Desktop (>768px): Standard AppShell with TopNav + inline SideNav
 * - Mobile (≤768px): SideNav hides, TopNav shows a hamburger button that
 *   opens the `mobileNav` drawer (an MobileNav rendered by AppShell)
 *
 * The nav sections are defined once and shared between `sideNav` and
 * `mobileNav`. AppShell handles rendering the MobileNav internally —
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
        <SideNavSection title="Main" isHeaderHidden>
          <SideNavItem
            label="Dashboard"
            icon={HomeIcon}
            selectedIcon={HomeIconSolid}
            isSelected
            href="#"
          />
          <SideNavItem
            label="Analytics"
            icon={ChartBarIcon}
            selectedIcon={ChartBarIconSolid}
            href="#"
          />
          <SideNavItem
            label="Projects"
            icon={FolderIcon}
            selectedIcon={FolderIconSolid}
            href="#"
            endContent={<Badge label={12} />}
          />
        </SideNavSection>
        <SideNavSection title="Organization">
          <SideNavItem
            label="Team"
            icon={UserGroupIcon}
            selectedIcon={UserGroupIconSolid}
            href="#"
          />
          <SideNavItem
            label="Settings"
            icon={Cog6ToothIcon}
            selectedIcon={Cog6ToothIconSolid}
            href="#"
          />
        </SideNavSection>
      </>
    );

    return (
      <AppShell
        contentPadding={6}
        topNav={
          <TopNav
            label="Main navigation"
            heading={
              <TopNavHeading
                heading="Acme App"
                logo={
                  <NavIcon
                    icon={<CubeIcon style={{width: 16, height: 16}} />}
                  />
                }
              />
            }
            startContent={
              isMobile ? (
                <Button
                  label="Menu"
                  variant="ghost"
                  icon={<Icon icon="menu" color="inherit" />}
                  onClick={() => setMobileNavOpen(true)}
                  isIconOnly
                />
              ) : (
                <>
                  <TopNavItem label="Home" href="#" isSelected />
                  <TopNavItem label="Products" href="#" />
                  <TopNavItem label="Docs" href="#" />
                </>
              )
            }
            endContent={
              <>
                <Button
                  label="Notifications"
                  variant="ghost"
                  icon={<BellIcon style={{width: 16, height: 16}} />}
                  isIconOnly
                />
                <Button
                  label="Profile"
                  variant="ghost"
                  icon={<UserCircleIcon style={{width: 16, height: 16}} />}
                  isIconOnly
                />
              </>
            }
          />
        }
        sideNav={<SideNav>{navSections}</SideNav>}
        mobileNav={
          <MobileNav
            isOpen={mobileNavOpen}
            onOpenChange={open => setMobileNavOpen(open)}
            header="Acme App">
            {navSections}
          </MobileNav>
        }>
        <MockContent />
      </AppShell>
    );
  },
};
