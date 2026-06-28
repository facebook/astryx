// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Switch} from '@astryxdesign/core/Switch';
import {HStack} from '@astryxdesign/core/HStack';
import {Selector} from '@astryxdesign/core/Selector';

export default function SettingsPage() {
  return (
    <VStack gap="xl" style={{maxWidth: 700, padding: 'var(--xds-spacing-xl)'}}>
      <Heading level={1}>Settings</Heading>

      <Card>
        <VStack gap="md" style={{padding: 'var(--xds-spacing-lg)'}}>
          <Heading level={2}>Account</Heading>
          <Text color="secondary">Manage your account preferences and profile visibility.</Text>
          <Divider />
          <HStack justify="between" align="center">
            <Text weight="semibold">Profile visibility</Text>
            <Selector
              label="Profile visibility"
              options={['Public', 'Friends only', 'Private']}
              value="Public"
              onChange={() => {}}
            />
          </HStack>
          <HStack justify="between" align="center">
            <Text weight="semibold">Two-factor authentication</Text>
            <Switch label="Enable 2FA" />
          </HStack>
        </VStack>
      </Card>

      <Card>
        <VStack gap="md" style={{padding: 'var(--xds-spacing-lg)'}}>
          <Heading level={2}>Notifications</Heading>
          <Text color="secondary">Choose which notifications you want to receive and how.</Text>
          <Divider />
          <HStack justify="between" align="center">
            <Text weight="semibold">Email digest</Text>
            <Switch label="Email digest" defaultChecked />
          </HStack>
          <HStack justify="between" align="center">
            <Text weight="semibold">Marketing emails</Text>
            <Switch label="Marketing emails" />
          </HStack>
        </VStack>
      </Card>

      <Card>
        <VStack gap="md" style={{padding: 'var(--xds-spacing-lg)'}}>
          <Heading level={2}>Appearance</Heading>
          <Text color="secondary">Customize how the application looks and feels on your device.</Text>
          <Divider />
          <HStack justify="between" align="center">
            <Text weight="semibold">Theme</Text>
            <Selector
              label="Theme"
              options={['Light', 'Dark', 'System']}
              value="System"
              onChange={() => {}}
            />
          </HStack>
          <HStack justify="between" align="center">
            <Text weight="semibold">Reduce motion</Text>
            <Switch label="Reduce motion" />
          </HStack>
        </VStack>
      </Card>
    </VStack>
  );
}
