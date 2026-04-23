'use client';

import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSSkeleton} from '@xds/core/Skeleton';
import {XDSCenter} from '@xds/core/Center';

export default function AspectRatioWithSkeleton() {
  return (
    <XDSCenter width={600}>
      <XDSAspectRatio ratio={16 / 9}>
        <XDSSkeleton width="100%" height="100%" />
      </XDSAspectRatio>
    </XDSCenter>
  );
}
