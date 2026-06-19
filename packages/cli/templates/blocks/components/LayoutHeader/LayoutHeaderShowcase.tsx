// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  Layout,
  LayoutHeader,
  LayoutContent,
  LayoutFooter,
  LayoutPanel,
  Card,
  HStack,
} from '@xds/core/Layout';
import {Center} from '@xds/core/Center';
import {Heading} from '@xds/core/Text';
import {Button} from '@xds/core/Button';

export default function LayoutHeaderShowcase() {
  return (
    <Center width={400}>
      <Layout
        style={{width: '100%'}}
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={2} vAlign="center" hAlign="between">
              <Heading level={4}>Dashboard</Heading>
              <HStack gap={2}>
                <Button label="Export" variant="secondary">
                  Export
                </Button>
                <Button label="New Item" variant="primary">
                  New Item
                </Button>
              </HStack>
            </HStack>
          </LayoutHeader>
        }
        start={
          <LayoutPanel hasDivider width={140}>
            <Card variant="muted" />
          </LayoutPanel>
        }
        content={
          <LayoutContent>
            <Card variant="muted" />
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <Card variant="muted" />
          </LayoutFooter>
        }
      />
    </Center>
  );
}
