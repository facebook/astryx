// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  Layout,
  LayoutHeader,
  LayoutContent,
  LayoutPanel,
  VStack,
} from '@astryxdesign/core/Layout';
import {Card} from '@astryxdesign/core/Card';
import {Heading, Text} from '@astryxdesign/core/Text';
import {List, ListItem} from '@astryxdesign/core/List';

export default function LayoutDualPanelLayout() {
  return (
    <Card width="100%" style={{maxWidth: 500}}>
      <Layout
        header={
          <LayoutHeader hasDivider>
            <Heading level={4}>File Browser</Heading>
          </LayoutHeader>
        }
        start={
          <LayoutPanel width={120} hasDivider>
            <VStack gap={1}>
              <Text type="label" color="secondary">
                Folders
              </Text>
              <List>
                <ListItem label="Documents" />
                <ListItem label="Projects" isSelected />
                <ListItem label="Downloads" />
              </List>
            </VStack>
          </LayoutPanel>
        }
        content={
          <LayoutContent>
            <VStack gap={2}>
              <Text type="label" color="secondary">
                Files
              </Text>
              <Card variant="muted">
                <Text type="body">
                  Select a folder to view its contents
                </Text>
              </Card>
            </VStack>
          </LayoutContent>
        }
        end={
          <LayoutPanel width={120} hasDivider>
            <VStack gap={2}>
              <Text type="label" color="secondary">
                Details
              </Text>
              <Text type="body">Select a file to view details</Text>
            </VStack>
          </LayoutPanel>
        }
      />
    </Card>
  );
}
