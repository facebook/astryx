// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Skeleton} from '@astryxdesign/core/Skeleton';
import {HStack, VStack} from '@astryxdesign/core/Layout';

export default function SkeletonShowcase() {
  return (
    <VStack gap={4} width={300}>
      <HStack gap={4} vAlign="center">
        <Skeleton width={64} height={64} radius="rounded" index={0} />
        <VStack gap={2}>
          <Skeleton width={160} height={20} index={1} />
          <Skeleton width={80} height={16} index={2} />
        </VStack>
      </HStack>
      <VStack gap={2}>
        <Skeleton width="90%" height={16} index={3} />
        <Skeleton width="100%" height={16} index={4} />
        <Skeleton width="75%" height={16} index={5} />
      </VStack>
    </VStack>
  );
}
