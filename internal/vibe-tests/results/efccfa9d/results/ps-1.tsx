// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Layout, LayoutHeader, LayoutContent, LayoutPanel} from '@astryxdesign/core/Layout';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';

const navSections = ['General', 'Notifications', 'Security', 'Billing'];

export default function SettingsDashboard() {
  return (
    <Layout height="fill">
      <LayoutHeader hasDivider>
        <HStack gap={2} align="center">
          <Heading level={1}>Settings</Heading>
        </HStack>
      </LayoutHeader>
      <Layout
        start={
          <LayoutPanel width={220} hasDivider>
            <VStack gap={2}>
              {navSections.map((section) => (
                <Text key={section} weight="medium">{section}</Text>
              ))}
            </VStack>
          </LayoutPanel>
        }
        content={
          <LayoutContent padding={5}>
            <VStack gap={5}>
              <Card padding={4}>
                <VStack gap={3}>
                  <Heading level={3}>General</Heading>
                  <Divider />
                  <Text>Manage your account settings and preferences.</Text>
                </VStack>
              </Card>
              <Card padding={4}>
                <VStack gap={3}>
                  <Heading level={3}>Notifications</Heading>
                  <Divider />
                  <Text>Configure how and when you receive notifications.</Text>
                </VStack>
              </Card>
            </VStack>
          </LayoutContent>
        }
      />
    </Layout>
  );
}
