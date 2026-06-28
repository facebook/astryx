// Copyright (c) Meta Platforms, Inc. and affiliates.

import {AppShell} from '@astryxdesign/core/AppShell';
import {TopNav} from '@astryxdesign/core/TopNav';
import {SideNav} from '@astryxdesign/core/SideNav';
import {NavItem} from '@astryxdesign/core/NavItem';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Card} from '@astryxdesign/core/Card';
import {Switch} from '@astryxdesign/core/Switch';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';

export default function SettingsDashboard() {
  return (
    <AppShell>
      <AppShell.Header>
        <TopNav>
          <HStack gap="md" align="center">
            <Text weight="bold" size="lg">MyApp</Text>
          </HStack>
        </TopNav>
      </AppShell.Header>
      <AppShell.Sidebar>
        <SideNav>
          <NavItem href="/settings/general" icon={<Icon name="settings" />}>
            General
          </NavItem>
          <NavItem href="/settings/notifications" icon={<Icon name="bell" />}>
            Notifications
          </NavItem>
          <NavItem href="/settings/security" icon={<Icon name="shield" />}>
            Security
          </NavItem>
          <NavItem href="/settings/billing" icon={<Icon name="credit-card" />}>
            Billing
          </NavItem>
        </SideNav>
      </AppShell.Sidebar>
      <AppShell.Main>
        <VStack gap="xl" style={{padding: 'var(--xds-spacing-xl)', maxWidth: 800}}>
          <Heading level={1}>Settings</Heading>
          <Card>
            <VStack gap="md" style={{padding: 'var(--xds-spacing-lg)'}}>
              <Heading level={3}>General</Heading>
              <Divider />
              <HStack justify="between" align="center">
                <VStack gap="xs">
                  <Text weight="semibold">Dark mode</Text>
                  <Text size="sm" color="secondary">Use dark theme across the app</Text>
                </VStack>
                <Switch label="Dark mode" />
              </HStack>
              <HStack justify="between" align="center">
                <VStack gap="xs">
                  <Text weight="semibold">Compact view</Text>
                  <Text size="sm" color="secondary">Reduce spacing between elements</Text>
                </VStack>
                <Switch label="Compact view" />
              </HStack>
            </VStack>
          </Card>
          <Card>
            <VStack gap="md" style={{padding: 'var(--xds-spacing-lg)'}}>
              <Heading level={3}>Notifications</Heading>
              <Divider />
              <HStack justify="between" align="center">
                <VStack gap="xs">
                  <Text weight="semibold">Email notifications</Text>
                  <Text size="sm" color="secondary">Receive updates via email</Text>
                </VStack>
                <Switch label="Email notifications" defaultChecked />
              </HStack>
              <HStack justify="between" align="center">
                <VStack gap="xs">
                  <Text weight="semibold">Push notifications</Text>
                  <Text size="sm" color="secondary">Receive browser push notifications</Text>
                </VStack>
                <Switch label="Push notifications" />
              </HStack>
            </VStack>
          </Card>
        </VStack>
      </AppShell.Main>
    </AppShell>
  );
}
