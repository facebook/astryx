// Copyright (c) Meta Platforms, Inc. and affiliates.

import { Stack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { SideNav } from '@astryxdesign/core/SideNav';
import { MobileNav } from '@astryxdesign/core/MobileNav';
import { AppShell } from '@astryxdesign/core/AppShell';

const navItems = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Projects', href: '#projects' },
  { label: 'Team', href: '#team' },
  { label: 'Settings', href: '#settings' },
];

export default function ResponsiveSidebar() {
  return (
    <AppShell
      sideNav={
        <SideNav>
          {navItems.map((item) => (
            <SideNav.Item key={item.label} href={item.href}>
              {item.label}
            </SideNav.Item>
          ))}
        </SideNav>
      }
      mobileNav={
        <MobileNav>
          {navItems.map((item) => (
            <MobileNav.Item key={item.label} href={item.href}>
              {item.label}
            </MobileNav.Item>
          ))}
        </MobileNav>
      }
    >
      <Stack gap={3}>
        <Text type="display-3" weight="bold">Content Area</Text>
        <Text color="secondary">
          The sidebar collapses to a bottom sheet on mobile viewports.
        </Text>
        <Card padding={3}>
          <Text>Main content goes here.</Text>
        </Card>
      </Stack>
    </AppShell>
  );
}
