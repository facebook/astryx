// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutFooter,
  LayoutPanel,
  Card,
  HStack,
} from '@astryxdesign/core/Layout';
import {Center} from '@astryxdesign/core/Center';
import {Button} from '@astryxdesign/core/Button';

export default function LayoutFooterShowcase() {
  return (
    <Center width={400}>
      <Layout
        style={{width: '100%'}}
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <Card variant="muted" />
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
            <HStack gap={2} hAlign="end">
              <Button label="Cancel" variant="secondary">
                Cancel
              </Button>
              <Button label="Save" variant="primary">
                Save
              </Button>
            </HStack>
          </LayoutFooter>
        }
      />
    </Center>
  );
}
