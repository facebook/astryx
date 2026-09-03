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
        <LayoutContent height="auto">
          <VStack gap={3}>
            <Text type="body">
              The contentWidth prop aligns header, body, and footer content to a
              shared maximum width. Setting LayoutContent height="auto" moves
              the body into the full-width Layout middle scrollport while its
              content stays aligned.
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
