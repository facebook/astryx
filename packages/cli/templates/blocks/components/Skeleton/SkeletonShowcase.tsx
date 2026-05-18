// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSSkeleton} from '@xds/core/Skeleton';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';

export default function SkeletonShowcase() {
  return (
    <XDSVStack gap={4} width={300}>
      <XDSHStack gap={4} vAlign="center">
        <XDSSkeleton width={64} height={64} radius="rounded" index={0} />
        <XDSVStack gap={2}>
          <XDSSkeleton width={160} height={20} index={1} />
          <XDSSkeleton width={80} height={16} index={2} />
        </XDSVStack>
      </XDSHStack>
      <XDSVStack gap={2}>
        <XDSSkeleton width="90%" height={16} index={3} />
        <XDSSkeleton width="100%" height={16} index={4} />
        <XDSSkeleton width="75%" height={16} index={5} />
      </XDSVStack>
    </XDSVStack>
  );
}
