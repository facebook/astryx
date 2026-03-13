'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';

import {XDSVStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {
  XDSTopNav,
  XDSTopNavHeading,
  XDSTopNavItem,
  XDSTopNavMegaMenu,
} from '@xds/core/TopNav';
import {XDSNavIcon} from '@xds/core/NavIcon';

const styles = stylex.create({
  container: {
    maxWidth: 960,
  },
  navWrapper: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'visible',
    backgroundColor: 'var(--color-surface, #fff)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    transitionProperty: 'border-radius, box-shadow',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease-out',
  },
  // When the mega menu opens, the wrapper becomes the top half of the
  // unified card: drop the bottom radius so it flows seamlessly into the
  // panel, and remove the wrapper shadow (the panel provides its own
  // shadow that visually wraps the dropdown area).
  navWrapperMenuOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    boxShadow:
      '0 -1px 3px rgba(0, 0, 0, 0.06), -1px 0 3px rgba(0, 0, 0, 0.04), 1px 0 3px rgba(0, 0, 0, 0.04)',
  },
});

// =============================================================================
// Icons
// =============================================================================

const LogoIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="18.5" cy="8.5" r="1.5" />
    <circle cx="18.5" cy="15.5" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
    <circle cx="5.5" cy="15.5" r="1.5" />
    <circle cx="5.5" cy="8.5" r="1.5" />
  </svg>
);

const ChartIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </svg>
);

const LayersIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ZapIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const CodeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const GlobeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// =============================================================================
// Demo Data
// =============================================================================

const productItems = [
  {
    title: 'Analytics',
    description: 'Track and analyze user behavior across your applications',
    icon: <ChartIcon />,
    href: '#analytics',
  },
  {
    title: 'Platform',
    description: 'End-to-end infrastructure for building at scale',
    icon: <LayersIcon />,
    href: '#platform',
  },
  {
    title: 'Security',
    description: 'Enterprise-grade protection for your data and users',
    icon: <ShieldIcon />,
    href: '#security',
  },
  {
    title: 'Automation',
    description: 'Streamline workflows with intelligent automation tools',
    icon: <ZapIcon />,
    href: '#automation',
  },
  {
    title: 'Developer Tools',
    description: 'APIs, SDKs, and CLI tools for seamless integration',
    icon: <CodeIcon />,
    href: '#dev-tools',
  },
  {
    title: 'Global Network',
    description: 'Low-latency edge infrastructure in 40+ regions',
    icon: <GlobeIcon />,
    href: '#network',
  },
];

const solutionItems = [
  {
    title: 'Enterprise',
    description: 'Solutions for large-scale organizations',
    icon: <LayersIcon />,
    href: '#enterprise',
  },
  {
    title: 'Startups',
    description: 'Get started fast with startup-friendly pricing',
    icon: <ZapIcon />,
    href: '#startups',
  },
  {
    title: 'Developers',
    description: 'Build with powerful APIs and documentation',
    icon: <CodeIcon />,
    href: '#developers',
  },
];

// =============================================================================
// Page
// =============================================================================

/**
 * Demo page for XDSTopNavMegaMenu — a nav item with a full-width mega menu.
 */
export default function MegaMenuPage() {
  const [menuOpen1, setMenuOpen1] = useState(false);
  const [menuOpen2, setMenuOpen2] = useState(false);
  const [menuOpen3, setMenuOpen3] = useState(false);

  const isAnyOpen1 = menuOpen1 || menuOpen2;

  return (
    <div {...stylex.props(styles.container)}>
      <XDSVStack gap={6}>
        <XDSVStack gap={2}>
          <XDSHeading level={1}>Mega Menu</XDSHeading>
          <XDSText type="body" color="secondary">
            A top nav variation with a full-width mega menu that appears on
            hover. The nav bar and dropdown panel appear as one unified card.
            Hover over &quot;Products&quot; or &quot;Solutions&quot; to see it.
          </XDSText>
        </XDSVStack>

        {/* Full mega menu with featured content */}
        <XDSVStack gap={3}>
          <XDSHeading level={2}>With Featured Content</XDSHeading>
          <div {...stylex.props(styles.navWrapper)}>
            <XDSTopNav
              label="Marketing navigation"
              heading={
                <XDSTopNavHeading
                  heading="Marketing"
                  logo={<XDSNavIcon icon={<LogoIcon />} />}
                  href="#"
                />
              }
              startContent={
                <>
                  <XDSTopNavMegaMenu
                    label="Products"
                    items={productItems}
                    onOpenChange={setMenuOpen1}
                    featured={{
                      image:
                        'https://images.unsplash.com/photo-1551434678-e076c223a692?w=560&h=280&fit=crop',
                      imageAlt: 'Team collaboration',
                      title: 'What\u2019s new in v4.0',
                      description:
                        'Explore the latest features including AI-powered analytics and real-time collaboration.',
                      linkText: 'Read the announcement \u2192',
                      linkHref: '#announcement',
                    }}
                  />
                  <XDSTopNavMegaMenu
                    label="Solutions"
                    items={solutionItems}
                    onOpenChange={setMenuOpen2}
                    featured={{
                      title: 'Customer Stories',
                      description:
                        'See how leading companies are building with our platform.',
                      linkText: 'View case studies \u2192',
                      linkHref: '#case-studies',
                    }}
                  />
                  <XDSTopNavItem label="Learn" href="#" />
                </>
              }
              endContent={
                <>
                  <XDSButton label="Login" variant="ghost" />
                  <XDSButton label="Get started" variant="primary" />
                </>
              }
            />
          </div>
        </XDSVStack>

        {/* Without featured content */}
        <XDSVStack gap={3}>
          <XDSHeading level={2}>Without Featured Content</XDSHeading>
          <div {...stylex.props(styles.navWrapper)}>
            <XDSTopNav
              label="Simple navigation"
              heading={<XDSTopNavHeading heading="App" href="#" />}
              startContent={
                <>
                  <XDSTopNavItem label="Home" href="#" isSelected />
                  <XDSTopNavMegaMenu
                    label="Features"
                    items={[
                      {
                        title: 'Dashboard',
                        description: 'Overview of your key metrics',
                        icon: <ChartIcon />,
                        href: '#dashboard',
                      },
                      {
                        title: 'Integrations',
                        description: 'Connect with your favorite tools',
                        icon: <CodeIcon />,
                        href: '#integrations',
                      },
                      {
                        title: 'API Access',
                        description: 'Programmatic access to all features',
                        icon: <GlobeIcon />,
                        href: '#api',
                      },
                    ]}
                    isSingleColumn
                    onOpenChange={setMenuOpen3}
                  />
                  <XDSTopNavItem label="Pricing" href="#" />
                </>
              }
              endContent={<XDSButton label="Sign in" variant="primary" />}
            />
          </div>
        </XDSVStack>
      </XDSVStack>
    </div>
  );
}
