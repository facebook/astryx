'use client';

import {XDSSkeleton} from '@xds/core/Skeleton';

export default function SkeletonStaggeredAnimationForMultipleSkeletons() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <XDSSkeleton width={300} height={16} index={0} />
      <XDSSkeleton width={280} height={16} index={1} />
      <XDSSkeleton width={320} height={16} index={2} />
    </div>
  );
}
