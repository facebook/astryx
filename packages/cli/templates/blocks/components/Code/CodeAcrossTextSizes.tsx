// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Code} from '@xds/core/CodeBlock';
import {Text} from '@xds/core/Text';
import {Heading} from '@xds/core/Text';
import {VStack} from '@xds/core/Stack';

export default function CodeAcrossTextSizes() {
  return (
    <VStack gap={3}>
      <Heading level={3}>
        Heading with <Code>inline code</Code>
      </Heading>
      <Text type="body">
        Body text with <Code>inline code</Code>
      </Text>
      <Text type="supporting">
        Supporting text with <Code>inline code</Code>
      </Text>
      <Text type="label">
        Label text with <Code>inline code</Code>
      </Text>
    </VStack>
  );
}
