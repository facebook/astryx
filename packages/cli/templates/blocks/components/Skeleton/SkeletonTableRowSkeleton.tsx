'use client';

import {XDSSkeleton} from '@xds/core/Skeleton';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';

export default function SkeletonTableRowSkeleton() {
  return (
    <XDSVStack gap={2}>
      {[0, 1, 2, 3].map(rowIndex => (
        <XDSHStack key={rowIndex} gap={4} vAlign="center">
          <XDSSkeleton width={50} height={16} index={rowIndex * 4} />
          <XDSSkeleton width={180} height={16} index={rowIndex * 4 + 1} />
          <XDSSkeleton width={100} height={16} index={rowIndex * 4 + 2} />
          <XDSSkeleton width={80} height={16} index={rowIndex * 4 + 3} />
        </XDSHStack>
      ))}
    </XDSVStack>
  );
}
