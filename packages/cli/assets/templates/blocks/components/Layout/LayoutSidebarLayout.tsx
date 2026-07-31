// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  Layout,
  LayoutHeader,
  LayoutContent,
  LayoutFooter,
  LayoutPanel,
  HStack,
  VStack,
} from '@astryxdesign/core/Layout';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Heading, Text} from '@astryxdesign/core/Text';
import {List, ListItem} from '@astryxdesign/core/List';

export default function LayoutSidebarLayout() {
  return (
    <Card width="100%" style={{maxWidth: 500}}>
      <Layout
        header={
          <LayoutHeader hasDivider>
            <Heading level={4}>Settings</Heading>
          </LayoutHeader>
        }
        start={
          <LayoutPanel hasDivider role="navigation" width={150}>
            <List>
              <ListItem label="General" isSelected />
              <ListItem label="Account" />
              <ListItem label="Privacy" />
              <ListItem label="Notifications" />
              <ListItem label="Security" />
            </List>
          </LayoutPanel>
        }
        content={
          <LayoutContent>
            <VStack gap={3}>
              <Heading level={5}>General Settings</Heading>
              <Text type="body">
                Configure your general preferences here. The sidebar navigation
                allows you to switch between different settings sections.
              </Text>
            </VStack>
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <HStack gap={2} hAlign="end">
              <Button label="Reset" variant="secondary">
                Reset
              </Button>
              <Button label="Save Changes" variant="primary">
                Save Changes
              </Button>
            </HStack>
          </LayoutFooter>
        }
      />
    </Card>
  );
}
