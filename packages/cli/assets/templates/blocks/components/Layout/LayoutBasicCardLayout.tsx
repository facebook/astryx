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
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Heading, Text} from '@astryxdesign/core/Text';

export default function LayoutBasicCardLayout() {
  return (
    <Card height={300} width="100%" style={{maxWidth: 400}}>
      <Layout
        header={
          <LayoutHeader hasDivider>
            <Heading level={4}>Card Title</Heading>
          </LayoutHeader>
        }
        content={
          <LayoutContent>
            <VStack gap={3}>
              <Text type="body">
                This is a basic card layout with a header, scrollable content
                area, and footer. The layout automatically handles padding and
                spacing between sections.
              </Text>
              <Text type="body">
                When content exceeds the available height, the content area
                scrolls independently while the header and footer stay fixed in
                place.
              </Text>
              <Text type="body">
                This pattern works well for modal dialogs, detail panels, and
                any card where the amount of content is unpredictable.
              </Text>
              <Text type="body">
                The dividers between header, content, and footer provide clear
                visual boundaries between the fixed and scrollable regions.
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
              <Button label="Save" variant="primary">
                Save
              </Button>
            </HStack>
          </LayoutFooter>
        }
      />
    </Card>
  );
}
