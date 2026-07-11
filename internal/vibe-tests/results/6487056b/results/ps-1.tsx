// Copyright (c) Meta Platforms, Inc. and affiliates.

import { AppShell } from '@astryxdesign/core/AppShell';
import { TopNav } from '@astryxdesign/core/TopNav';
import { SideNav } from '@astryxdesign/core/SideNav';
import { Text } from '@astryxdesign/core/Text';
import { Stack } from '@astryxdesign/core/Stack';
import { Card } from '@astryxdesign/core/Card';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Switch } from '@astryxdesign/core/Switch';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { Section } from '@astryxdesign/core/Section';

export default function SettingsDashboard() {
  return (
    <AppShell
      topNav={
        <TopNav>
          <TopNav.Start>
            <Text weight="bold">Settings</Text>
          </TopNav.Start>
        </TopNav>
      }
      sideNav={
        <SideNav>
          <SideNav.Item href="#general" isActive>General</SideNav.Item>
          <SideNav.Item href="#notifications">Notifications</SideNav.Item>
          <SideNav.Item href="#security">Security</SideNav.Item>
          <SideNav.Item href="#billing">Billing</SideNav.Item>
        </SideNav>
      }
    >
      <Stack gap={4}>
        <Text type="display-3" weight="bold">General Settings</Text>
        <Section>
          <Card padding={3}>
            <Stack gap={3}>
              <Text type="label" weight="semibold">Profile</Text>
              <TextInput label="Display Name" defaultValue="John Doe" />
              <TextInput label="Email" defaultValue="john@example.com" type="email" />
              <Divider />
              <Text type="label" weight="semibold">Preferences</Text>
              <Switch label="Enable notifications" defaultChecked />
              <Switch label="Dark mode" />
              <Divider />
              <Button variant="primary">Save Changes</Button>
            </Stack>
          </Card>
        </Section>
      </Stack>
    </AppShell>
  );
}
