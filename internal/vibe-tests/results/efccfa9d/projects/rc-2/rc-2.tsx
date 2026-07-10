// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card} from '@astryxdesign/core/Card';
import {Layout, LayoutPanel, LayoutContent} from '@astryxdesign/core/Layout';
import {VStack} from '@astryxdesign/core/VStack';
import {Text} from '@astryxdesign/core/Text';
import {Heading} from '@astryxdesign/core/Heading';
import {Divider} from '@astryxdesign/core/Divider';

const navItems = ['Dashboard', 'Analytics', 'Settings', 'Help'];

export default function ResponsiveSidebar() {
  return (
    <Layout
      start={
        <LayoutPanel width={260} hasDivider>
          <VStack gap={2}>
            <Heading level={3}>Navigation</Heading>
            <Divider />
            {navItems.map((item) => (
              <Text key={item}>{item}</Text>
            ))}
          </VStack>
        </LayoutPanel>
      }
      content={
        <LayoutContent padding={4}>
          <VStack gap={4}>
            <Heading level={2}>Main Content</Heading>
            <Card padding={4}>
              <Text>This layout has a sidebar that can be used for navigation on desktop. On smaller viewports, consider adapting this to a bottom sheet or overlay pattern.</Text>
            </Card>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
