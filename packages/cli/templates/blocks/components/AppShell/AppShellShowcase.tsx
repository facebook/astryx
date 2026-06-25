// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {AppShell} from '@astryxdesign/core/AppShell';
import {VStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';
import {NavIcon} from '@astryxdesign/core/NavIcon';
import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from '@astryxdesign/core/SideNav';
import {
  ChartBarIcon,
  DocumentTextIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import {HomeIcon} from '@heroicons/react/24/solid';
import {CubeIcon} from '@heroicons/react/24/outline';

export default function AppShellShowcase() {
  return (
    <AppShell
      contentPadding={6}
      style={{height: '100%', minHeight: 0, width: '100%'}}
      sideNav={
        <SideNav
          header={
            <SideNavHeading
              icon={
                <NavIcon
                  icon={<CubeIcon style={{width: 16, height: 16}} />}
                />
              }
              heading="App Shell"
              headingHref="#"
            />
          }>
          <SideNavSection title="Main" isHeaderHidden>
            <SideNavItem label="Home" icon={HomeIcon} isSelected href="#" />
            <SideNavItem label="Reports" icon={ChartBarIcon} href="#" />
            <SideNavItem
              label="Documents"
              icon={DocumentTextIcon}
              href="#"
            />
            <SideNavItem label="Team" icon={UsersIcon} href="#" />
          </SideNavSection>
        </SideNav>
      }>
      <VStack gap={4}>
        <Heading level={3}>Page Content</Heading>
        <Text type="body">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </Text>
      </VStack>
    </AppShell>
  );
}
