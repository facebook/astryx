'use client';

import {XDSSkeleton} from '@xds/core/Skeleton';

export default function SkeletonCircularAvatarPlaceholder() {
  return (
    <XDSSkeleton width={40} height={40} radius="rounded" />
  );
}

export const showcase = {
  aspectRatio: 1,
  render: SkeletonCircularAvatarPlaceholder,
};
