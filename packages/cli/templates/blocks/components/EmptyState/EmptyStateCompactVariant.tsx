'use client';

import {XDSEmptyState} from '@xds/core/EmptyState';

export default function EmptyStateCompactVariant() {
  return (
    <XDSEmptyState
      title="No items"
      description="Nothing to show here."
      isCompact
    />
  );
}
