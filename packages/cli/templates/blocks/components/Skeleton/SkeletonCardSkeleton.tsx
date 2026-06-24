// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Skeleton} from '@astryxdesign/core/Skeleton';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Layout';

export default function SkeletonCardSkeleton() {
  return (
    <Card width={320}>
      <VStack gap={3}>
        <HStack gap={3} vAlign="center">
          <Skeleton width={40} height={40} radius="rounded" index={0} />
          <VStack gap={1}>
            <Skeleton width={120} height={14} index={1} />
            <Skeleton width={80} height={12} index={2} />
          </VStack>
        </HStack>
        <Skeleton width="100%" height={14} index={3} />
        <Skeleton width="90%" height={14} index={4} />
        <Skeleton width="75%" height={14} index={5} />
      </VStack>
    </Card>
  );
}
