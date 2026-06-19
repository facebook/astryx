// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';

import {VStack} from '@xds/core/Layout';
import {Text, Heading} from '@xds/core/Text';
import {Button} from '@xds/core/Button';
import {
  TopNav,
  TopNavHeading,
  TopNavItem,
  TopNavMegaMenu,
  TopNavMegaMenuItem,
  TopNavMegaMenuFeaturedCard,
} from '@xds/core/TopNav';
import {NavIcon} from '@xds/core/NavIcon';

const styles = stylex.create({
  container: {
    maxWidth: 960,
  },
  navWrapper: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'visible',
    backgroundColor: 'var(--color-background-surface, #fff)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    transitionProperty: 'border-radius, box-shadow',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease-out',
  },
  navWrapperMenuOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    boxShadow:
      '0 -1px 3px rgba(0, 0, 0, 0.06), -1px 0 3px rgba(0, 0, 0, 0.04), 1px 0 3px rgba(0, 0, 0, 0.04)',
  },
  featuredBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 16,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  featuredDescription: {
    fontSize: 14,
    color: 'var(--color-text-secondary)',
  },
  featuredLink: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-accent)',
    textDecoration: 'none',
  },
  featuredImage: {
    width: '100%',
    height: 140,
    objectFit: 'cover',
    display: 'block',
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
// Page
// =============================================================================

export default function MegaMenuPage() {
  const [_menuOpen1, setMenuOpen1] = useState(false);
  const [_menuOpen2, setMenuOpen2] = useState(false);
  const [_menuOpen3, setMenuOpen3] = useState(false);

  return (
    <div {...stylex.props(styles.container)}>
      <VStack gap={6}>
        <VStack gap={2}>
          <Heading level={1}>Mega Menu</Heading>
          <Text type="body" color="secondary">
            A top nav variation with a full-width mega menu that appears on
            hover. Uses the slots API with TopNavMegaMenuItem components.
          </Text>
        </VStack>

        {/* Full mega menu with featured content */}
        <VStack gap={3}>
          <Heading level={2}>With Featured Content</Heading>
          <div {...stylex.props(styles.navWrapper)}>
            <TopNav
              label="Marketing navigation"
              heading={
                <TopNavHeading
                  heading="Marketing"
                  logo={<NavIcon icon={<LogoIcon />} />}
                  href="#"
                />
              }
              startContent={
                <>
                  <TopNavMegaMenu
                    label="Products"
                    onOpenChange={setMenuOpen1}
                    items={
                      <>
                        <TopNavMegaMenuItem
                          title="Analytics"
                          description="Track and analyze user behavior across your applications"
                          icon={<ChartIcon />}
                          href="#analytics"
                        />
                        <TopNavMegaMenuItem
                          title="Platform"
                          description="End-to-end infrastructure for building at scale"
                          icon={<LayersIcon />}
                          href="#platform"
                        />
                        <TopNavMegaMenuItem
                          title="Security"
                          description="Enterprise-grade protection for your data and users"
                          icon={<ShieldIcon />}
                          href="#security"
                        />
                        <TopNavMegaMenuItem
                          title="Automation"
                          description="Streamline workflows with intelligent automation tools"
                          icon={<ZapIcon />}
                          href="#automation"
                        />
                        <TopNavMegaMenuItem
                          title="Developer Tools"
                          description="APIs, SDKs, and CLI tools for integration"
                          icon={<CodeIcon />}
                          href="#dev-tools"
                        />
                        <TopNavMegaMenuItem
                          title="Global Network"
                          description="Low-latency edge infrastructure in 40+ regions"
                          icon={<GlobeIcon />}
                          href="#network"
                        />
                      </>
                    }
                    featured={
                      <TopNavMegaMenuFeaturedCard
                        title="What's new in v4.0"
                        description="Explore the latest features including AI-powered analytics and real-time collaboration."
                        image="https://images.unsplash.com/photo-1551434678-e076c223a692?w=560&h=280&fit=crop"
                        imageAlt="Team collaboration"
                        linkLabel="Read the announcement"
                        linkHref="#announcement"
                      />
                    }
                  />
                  <TopNavMegaMenu
                    label="Solutions"
                    onOpenChange={setMenuOpen2}
                    items={
                      <>
                        <TopNavMegaMenuItem
                          title="Enterprise"
                          description="Solutions for large-scale organizations"
                          icon={<LayersIcon />}
                          href="#enterprise"
                        />
                        <TopNavMegaMenuItem
                          title="Startups"
                          description="Get started fast with startup-friendly pricing"
                          icon={<ZapIcon />}
                          href="#startups"
                        />
                        <TopNavMegaMenuItem
                          title="Developers"
                          description="Build with powerful APIs and documentation"
                          icon={<CodeIcon />}
                          href="#developers"
                        />
                      </>
                    }
                    featured={
                      <TopNavMegaMenuFeaturedCard
                        title="Customer Stories"
                        description="See how leading companies are building with our platform."
                        linkLabel="View case studies"
                        linkHref="#case-studies"
                      />
                    }
                  />
                  <TopNavItem label="Learn" href="#" />
                </>
              }
              endContent={
                <>
                  <Button label="Login" variant="ghost" />
                  <Button label="Get started" variant="primary" />
                </>
              }
            />
          </div>
        </VStack>

        {/* Without featured content */}
        <VStack gap={3}>
          <Heading level={2}>Without Featured Content</Heading>
          <div {...stylex.props(styles.navWrapper)}>
            <TopNav
              label="Simple navigation"
              heading={<TopNavHeading heading="App" href="#" />}
              startContent={
                <>
                  <TopNavItem label="Home" href="#" isSelected />
                  <TopNavMegaMenu
                    label="Features"
                    onOpenChange={setMenuOpen3}
                    items={
                      <>
                        <TopNavMegaMenuItem
                          title="Dashboard"
                          description="Overview of your key metrics"
                          icon={<ChartIcon />}
                          href="#dashboard"
                        />
                        <TopNavMegaMenuItem
                          title="Integrations"
                          description="Connect with your favorite tools"
                          icon={<CodeIcon />}
                          href="#integrations"
                        />
                        <TopNavMegaMenuItem
                          title="API Access"
                          description="Programmatic access to all features"
                          icon={<GlobeIcon />}
                          href="#api"
                        />
                      </>
                    }
                  />
                  <TopNavItem label="Pricing" href="#" />
                </>
              }
              endContent={<Button label="Sign in" variant="primary" />}
            />
          </div>
        </VStack>
      </VStack>
    </div>
  );
}
