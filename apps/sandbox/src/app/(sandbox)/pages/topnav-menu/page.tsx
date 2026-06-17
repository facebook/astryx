// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {VStack} from '@xds/core/Layout';
import {Text, Heading} from '@xds/core/Text';
import {Button} from '@xds/core/Button';
import {
  TopNav,
  TopNavHeading,
  TopNavItem,
  TopNavMenu,
} from '@xds/core/TopNav';
import {NavIcon} from '@xds/core/NavIcon';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    maxWidth: 960,
  },
  navWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
  },
});

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

const PlaceholderIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="4" />
  </svg>
);

const productItems = [
  {
    title: 'Approach',
    description: 'Microbiome science for human health',
    icon: <PlaceholderIcon />,
    href: '#approach',
  },
  {
    title: 'Platform',
    description: 'End-to-end discovery and development',
    icon: <PlaceholderIcon />,
    href: '#platform',
  },
];

const scienceItems = [
  {
    title: 'Research',
    description: 'Published studies and clinical trials',
    icon: <PlaceholderIcon />,
    href: '#research',
  },
  {
    title: 'Publications',
    description: 'Peer-reviewed papers and white papers',
    icon: <PlaceholderIcon />,
    href: '#publications',
  },
  {
    title: 'Team',
    description: 'Meet our scientific advisory board',
    icon: <PlaceholderIcon />,
    href: '#team',
  },
];

/**
 * Demo page for TopNavMenu — a nav item with hover-triggered overflow menu.
 */
export default function TopNavMenuPage() {
  return (
    <div {...stylex.props(styles.container)}>
      <VStack gap={6}>
        <VStack gap={2}>
          <Heading level={1}>TopNav Menu</Heading>
          <Text type="body" color="secondary">
            A nav item with a hover-triggered overflow menu. Hover over
            &quot;Products&quot; or &quot;Science&quot; to see the popover.
          </Text>
        </VStack>

        {/* Marketing-style nav with overflow menus */}
        <VStack gap={3}>
          <Heading level={2}>Marketing Nav</Heading>
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
                  <TopNavMenu label="Products" items={productItems} />
                  <TopNavMenu label="Science" items={scienceItems} />
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

        {/* Simple nav with one overflow menu */}
        <VStack gap={3}>
          <Heading level={2}>Simple Nav</Heading>
          <div {...stylex.props(styles.navWrapper)}>
            <TopNav
              label="Simple navigation"
              heading={<TopNavHeading heading="App" href="#" />}
              startContent={
                <>
                  <TopNavItem label="Home" href="#" isSelected />
                  <TopNavMenu
                    label="More"
                    items={[
                      {
                        title: 'Settings',
                        description: 'Configure your preferences',
                        href: '#settings',
                      },
                      {
                        title: 'Help',
                        description: 'Documentation and support',
                        href: '#help',
                      },
                    ]}
                  />
                </>
              }
            />
          </div>
        </VStack>
      </VStack>
    </div>
  );
}
