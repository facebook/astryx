// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {HStack, VStack} from '@xds/core/Layout';
import {Badge} from '@xds/core/Badge';
import {Text} from '@xds/core/Text';

export default function HStackShowcase() {
  return (
    <VStack gap={6} width="100%" style={{maxWidth: 400}}>
      <VStack gap={2}>
        <Text type="supporting" color="secondary">
          HAlign: start
        </Text>
        <HStack gap={2}>
          <Badge label="React" />
          <Badge label="TypeScript" />
          <Badge label="Node.js" />
        </HStack>
      </VStack>
      <VStack gap={2}>
        <Text type="supporting" color="secondary">
          HAlign: center
        </Text>
        <HStack gap={4} hAlign="center">
          <Badge label="Design" />
          <Badge label="Engineering" />
          <Badge label="Product" />
        </HStack>
      </VStack>
      <VStack gap={2}>
        <Text type="supporting" color="secondary">
          HAlign: between
        </Text>
        <HStack gap={2} hAlign="between">
          <Badge label="Start" />
          <Badge label="Middle" />
          <Badge label="End" />
        </HStack>
      </VStack>
    </VStack>
  );
}
