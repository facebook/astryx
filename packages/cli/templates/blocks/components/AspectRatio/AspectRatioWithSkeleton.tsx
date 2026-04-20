'use client';

import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSSkeleton} from '@xds/core/Skeleton';

export default function AspectRatioWithSkeleton() {
  return (
    <div style={{maxWidth: 600}}>
      <XDSAspectRatio ratio={16 / 9}>
        <XDSSkeleton width="100%" height="100%" />
      </XDSAspectRatio>
    </div>
  );
}
