// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  Layout,
  LayoutHeader,
  LayoutContent,
  LayoutFooter,
  HStack,
  VStack,
} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {Heading, Text} from '@astryxdesign/core/Text';

export default function LayoutShellWidth() {
  return (
    <Layout
      height="fill"
      shellWidth={360}
      defaultHasDividers
      header={
        <LayoutHeader>
          <Heading level={4}>Capped Shell</Heading>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <VStack gap={3}>
            <Text type="body">
              The shellWidth prop caps the entire shell (header, panels,
              content, footer) at a maximum width and centers it. Dividers end
              at the shell edge instead of spanning the full container.
            </Text>
            <Text type="body" color="secondary">
              Use contentWidth instead when headers and dividers should stay
              full-bleed.
            </Text>
          </VStack>
        </LayoutContent>
      }
      footer={
        <LayoutFooter>
          <HStack gap={2} hAlign="end">
            <Button label="Cancel" variant="secondary">
              Cancel
            </Button>
            <Button label="Submit" variant="primary">
              Submit
            </Button>
          </HStack>
        </LayoutFooter>
      }
    />
  );
}
