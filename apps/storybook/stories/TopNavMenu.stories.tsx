import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSTopNav,
  XDSTopNavHeading,
  XDSTopNavItem,
  XDSTopNavMenu,
  XDSTopNavMegaMenu,
  XDSTopNavMegaMenuGroup,
  XDSTopNavMegaMenuItem,
  XDSTopNavMegaMenuFeatured,
} from '@xds/core/TopNav';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSButton} from '@xds/core/Button';
import {
  CubeIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BoltIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

// =============================================================================
// TopNavMenu Stories
// =============================================================================

const menuMeta: Meta<typeof XDSTopNavMenu> = {
  title: 'Navigation/XDSTopNavMenu',
  component: XDSTopNavMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default menuMeta;
type Story = StoryObj<typeof XDSTopNavMenu>;

/**
 * Basic hover-triggered nav menu with 4 items, each with icon, title,
 * and description.
 */
export const Default: Story = {
  render: () => (
    <XDSTopNav
      label="Main navigation"
      heading={
        <XDSTopNavHeading
          heading="My App"
          logo={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
          href="#"
        />
      }
      startContent={
        <>
          <XDSTopNavItem label="Home" href="#" isSelected />
          <XDSTopNavMenu
            label="Products"
            items={[
              {
                title: 'Analytics',
                description: 'Track and analyze user behavior',
                icon: <ChartBarIcon style={{width: 20, height: 20}} />,
                href: '#analytics',
              },
              {
                title: 'Security',
                description: 'Enterprise-grade protection',
                icon: <ShieldCheckIcon style={{width: 20, height: 20}} />,
                href: '#security',
              },
              {
                title: 'Automation',
                description: 'Streamline your workflows',
                icon: <BoltIcon style={{width: 20, height: 20}} />,
                href: '#automation',
              },
              {
                title: 'Developer Tools',
                description: 'APIs, SDKs, and CLI tools',
                icon: <CodeBracketIcon style={{width: 20, height: 20}} />,
                href: '#dev-tools',
              },
            ]}
          />
          <XDSTopNavItem label="Pricing" href="#" />
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

/**
 * Multiple nav menus side by side. Hovering one closes the other
 * (standard hover-menu behavior).
 */
export const MultipleMenus: Story = {
  name: 'Multiple Menus',
  render: () => (
    <XDSTopNav
      label="Main navigation"
      heading={<XDSTopNavHeading heading="Platform" href="#" />}
      startContent={
        <>
          <XDSTopNavMenu
            label="Products"
            items={[
              {
                title: 'Analytics',
                description: 'Track behavior',
                icon: <ChartBarIcon style={{width: 20, height: 20}} />,
                href: '#',
              },
              {
                title: 'Security',
                description: 'Enterprise protection',
                icon: <ShieldCheckIcon style={{width: 20, height: 20}} />,
                href: '#',
              },
            ]}
          />
          <XDSTopNavMenu
            label="Resources"
            items={[
              {title: 'Documentation', href: '#'},
              {title: 'API Reference', href: '#'},
              {title: 'Community Forum', href: '#'},
            ]}
          />
          <XDSTopNavItem label="Pricing" href="#" />
        </>
      }
    />
  ),
};

// =============================================================================
// TopNavMegaMenu Stories — Composed Children API
// =============================================================================

/**
 * Full-width mega menu with composed children API.
 * Uses XDSTopNavMegaMenuGroup, XDSTopNavMegaMenuItem, and
 * XDSTopNavMegaMenuFeatured for declarative composition.
 */
export const MegaMenu: Story = {
  name: 'Mega Menu',
  render: function MegaMenuStory() {
    const [, setMenuOpen] = useState(false);

    return (
      <div style={{position: 'relative'}}>
        <XDSTopNav
          label="Marketing navigation"
          heading={
            <XDSTopNavHeading
              heading="Acme"
              logo={
                <XDSNavIcon
                  icon={<CubeIcon style={{width: 16, height: 16}} />}
                />
              }
              href="#"
            />
          }
          startContent={
            <>
              <XDSTopNavMegaMenu label="Products" onOpenChange={setMenuOpen}>
                <XDSTopNavMegaMenuGroup>
                  <XDSTopNavMegaMenuItem
                    title="Analytics"
                    description="Track and analyze user behavior across your apps"
                    icon={<ChartBarIcon style={{width: 20, height: 20}} />}
                    href="#analytics"
                  />
                  <XDSTopNavMegaMenuItem
                    title="Security"
                    description="Enterprise-grade protection for your data"
                    icon={<ShieldCheckIcon style={{width: 20, height: 20}} />}
                    href="#security"
                  />
                  <XDSTopNavMegaMenuItem
                    title="Automation"
                    description="Streamline workflows with intelligent tools"
                    icon={<BoltIcon style={{width: 20, height: 20}} />}
                    href="#automation"
                  />
                  <XDSTopNavMegaMenuItem
                    title="Developer Tools"
                    description="APIs, SDKs, and CLI for integration"
                    icon={<CodeBracketIcon style={{width: 20, height: 20}} />}
                    href="#dev-tools"
                  />
                  <XDSTopNavMegaMenuItem
                    title="Global Network"
                    description="Low-latency edge infra in 40+ regions"
                    icon={<GlobeAltIcon style={{width: 20, height: 20}} />}
                    href="#network"
                  />
                </XDSTopNavMegaMenuGroup>
                <XDSTopNavMegaMenuFeatured>
                  <img
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=560&h=280&fit=crop"
                    alt="Team collaboration"
                    style={{
                      width: '100%',
                      height: 140,
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      padding: 16,
                    }}>
                    <strong>What&apos;s new in v4.0</strong>
                    <span
                      style={{
                        fontSize: 14,
                        color: 'var(--color-text-secondary)',
                      }}>
                      AI-powered analytics and real-time collaboration.
                    </span>
                    <a
                      href="#announcement"
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--color-accent-text)',
                        textDecoration: 'none',
                      }}>
                      Read the announcement →
                    </a>
                  </div>
                </XDSTopNavMegaMenuFeatured>
              </XDSTopNavMegaMenu>
              <XDSTopNavItem label="Pricing" href="#" />
              <XDSTopNavItem label="Docs" href="#" />
            </>
          }
          endContent={
            <>
              <XDSButton label="Sign in" variant="ghost" />
              <XDSButton label="Get started" variant="primary" />
            </>
          }
        />
      </div>
    );
  },
};

/**
 * Mega menu without the featured content area — just the items grid.
 */
export const MegaMenuSimple: Story = {
  name: 'Mega Menu (Simple)',
  render: () => (
    <div style={{position: 'relative'}}>
      <XDSTopNav
        label="Simple navigation"
        heading={<XDSTopNavHeading heading="App" href="#" />}
        startContent={
          <>
            <XDSTopNavItem label="Home" href="#" isSelected />
            <XDSTopNavMegaMenu label="Features">
              <XDSTopNavMegaMenuGroup>
                <XDSTopNavMegaMenuItem
                  title="Dashboard"
                  description="Overview of your key metrics"
                  icon={<ChartBarIcon style={{width: 20, height: 20}} />}
                  href="#"
                />
                <XDSTopNavMegaMenuItem
                  title="Integrations"
                  description="Connect with your favorite tools"
                  icon={<CodeBracketIcon style={{width: 20, height: 20}} />}
                  href="#"
                />
                <XDSTopNavMegaMenuItem
                  title="API Access"
                  description="Programmatic access to all features"
                  icon={<GlobeAltIcon style={{width: 20, height: 20}} />}
                  href="#"
                />
              </XDSTopNavMegaMenuGroup>
            </XDSTopNavMegaMenu>
          </>
        }
        endContent={<XDSButton label="Sign in" variant="primary" />}
      />
    </div>
  ),
};
