// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Icon} from '@xds/core/Icon';
import {HStack, VStack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

export default function IconSemanticColors() {
  return (
    <HStack gap={4} wrap="wrap">
      <VStack gap={1} hAlign="center">
        <Icon icon="search" color="primary" />
        <Text type="supporting">primary</Text>
      </VStack>
      <VStack gap={1} hAlign="center">
        <Icon icon="menu" color="secondary" />
        <Text type="supporting">secondary</Text>
      </VStack>
      <VStack gap={1} hAlign="center">
        <Icon icon="info" color="tertiary" />
        <Text type="supporting">tertiary</Text>
      </VStack>
      <VStack gap={1} hAlign="center">
        <Icon icon="clock" color="disabled" />
        <Text type="supporting">disabled</Text>
      </VStack>
      <VStack gap={1} hAlign="center">
        <Icon icon="calendar" color="accent" />
        <Text type="supporting">accent</Text>
      </VStack>
      <VStack gap={1} hAlign="center">
        <Icon icon="success" color="success" />
        <Text type="supporting">success</Text>
      </VStack>
      <VStack gap={1} hAlign="center">
        <Icon icon="error" color="error" />
        <Text type="supporting">error</Text>
      </VStack>
      <VStack gap={1} hAlign="center">
        <Icon icon="warning" color="warning" />
        <Text type="supporting">warning</Text>
      </VStack>
    </HStack>
  );
}
