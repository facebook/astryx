'use client';

import {XDSEmptyState} from '@xds/core/EmptyState';

export default function EmptyStateShowcase() {
  return (
    <XDSEmptyState
      title="No results found"
      description="Try adjusting your search or filters to find what you need."
    />
  );
}
