// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {VStack} from '@xds/core/Layout';
import {Heading, Text} from '@xds/core/Text';

export default function HeadingPageLayout() {
  return (
    <VStack gap={6} width="100%" style={{maxWidth: 400}}>
      <VStack>
        <Heading level={1}>Dashboard Overview</Heading>
        <Text type="supporting" display="block">
          Last updated 5 minutes ago
        </Text>
      </VStack>
      <VStack>
        <Heading level={2}>Recent Activity</Heading>
        <Text type="body" display="block">
          Here's what's been happening in your workspace.
        </Text>
      </VStack>
      <VStack>
        <Heading level={3}>Today</Heading>
        <Text type="body" display="block">
          • Project Alpha updated
          <br />
          • 3 new comments
          <br />• Task completed
        </Text>
      </VStack>
    </VStack>
  );
}
