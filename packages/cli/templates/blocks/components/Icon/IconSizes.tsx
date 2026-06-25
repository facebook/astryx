// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Icon} from '@astryxdesign/core/Icon';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

export default function IconSizes() {
  return (
    <HStack gap={4}>
      <VStack gap={1} hAlign="center">
        <Icon icon="search" size="xsm" />
        <Text type="supporting">xsm</Text>
      </VStack>
      <VStack gap={1} hAlign="center">
        <Icon icon="search" size="sm" />
        <Text type="supporting">sm</Text>
      </VStack>
      <VStack gap={1} hAlign="center">
        <Icon icon="search" size="md" />
        <Text type="supporting">md</Text>
      </VStack>
      <VStack gap={1} hAlign="center">
        <Icon icon="search" size="lg" />
        <Text type="supporting">lg</Text>
      </VStack>
    </HStack>
  );
}
