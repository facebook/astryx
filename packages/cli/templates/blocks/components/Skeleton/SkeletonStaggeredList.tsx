'use client';

import {XDSSkeleton} from '@xds/core/Skeleton';
import {XDSVStack} from '@xds/core/Layout';

export default function SkeletonStaggeredList() {
  return (
    <XDSVStack gap={2}>
      <XDSSkeleton width={300} height={16} index={0} />
      <XDSSkeleton width={280} height={16} index={1} />
      <XDSSkeleton width={320} height={16} index={2} />
      <XDSSkeleton width={260} height={16} index={3} />
      <XDSSkeleton width={290} height={16} index={4} />
    </XDSVStack>
  );
}
