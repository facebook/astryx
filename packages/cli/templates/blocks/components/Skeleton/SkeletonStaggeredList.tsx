// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Skeleton} from '@xds/core/Skeleton';
import {VStack} from '@xds/core/Layout';

export default function SkeletonStaggeredList() {
  return (
    <VStack gap={2}>
      <Skeleton width={300} height={16} index={0} />
      <Skeleton width={280} height={16} index={1} />
      <Skeleton width={320} height={16} index={2} />
      <Skeleton width={260} height={16} index={3} />
      <Skeleton width={290} height={16} index={4} />
    </VStack>
  );
}
