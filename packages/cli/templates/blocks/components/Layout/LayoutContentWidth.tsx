// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  Layout,
  LayoutHeader,
  LayoutContent,
  LayoutFooter,
  HStack,
  VStack,
} from '@xds/core/Layout';
import {Button} from '@xds/core/Button';
import {Heading, Text} from '@xds/core/Text';

export default function LayoutContentWidth() {
  return (
    <Layout
      height="fill"
      contentWidth={360}
      header={
        <LayoutHeader hasDivider>
          <Heading level={4}>Centered Form</Heading>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <VStack gap={3}>
            <Text type="body">
              The contentWidth prop constrains content to a maximum width and
              centers it within the layout. Dividers remain full-bleed while
              content stays narrow and readable.
            </Text>
            <Text type="body" color="secondary">
              Common widths: 640 for forms, 960 for content pages.
            </Text>
          </VStack>
        </LayoutContent>
      }
      footer={
        <LayoutFooter hasDivider>
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
