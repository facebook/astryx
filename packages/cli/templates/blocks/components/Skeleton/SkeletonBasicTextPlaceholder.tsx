'use client';

import {XDSSkeleton} from '@xds/core/Skeleton';

export default function SkeletonBasicTextPlaceholder() {
  return (
    <XDSSkeleton width={200} height={16} />
  );
}

export const showcase = {
  aspectRatio: 1,
  render: SkeletonBasicTextPlaceholder,
};
