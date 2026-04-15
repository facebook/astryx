'use client';

import {XDSEmptyState} from '@xds/core/EmptyState';

export default function EmptyStateWithDescription() {
  return (
    <XDSEmptyState
      title="No results found"
      description="Try adjusting your search or filters."
    />
  );
}
