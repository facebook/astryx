'use client';

import {XDSSkeleton} from '@xds/core/Skeleton';
import {XDSCard} from '@xds/core/Card';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';

export default function SkeletonCardSkeleton() {
  return (
    <XDSCard width={320}>
      <XDSVStack gap={3}>
        <XDSHStack gap={3} vAlign="center">
          <XDSSkeleton width={40} height={40} radius="rounded" index={0} />
          <XDSVStack gap={1}>
            <XDSSkeleton width={120} height={14} index={1} />
            <XDSSkeleton width={80} height={12} index={2} />
          </XDSVStack>
        </XDSHStack>
        <XDSSkeleton width="100%" height={14} index={3} />
        <XDSSkeleton width="90%" height={14} index={4} />
        <XDSSkeleton width="75%" height={14} index={5} />
      </XDSVStack>
    </XDSCard>
  );
}
