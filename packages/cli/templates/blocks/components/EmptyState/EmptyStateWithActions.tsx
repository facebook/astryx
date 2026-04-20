'use client';

import {XDSEmptyState} from '@xds/core/EmptyState';
import {XDSButton} from '@xds/core/Button';

export default function EmptyStateWithActions() {
  return (
    <XDSEmptyState
      icon={<span style={{fontSize: '48px'}}>🔍</span>}
      title="No results found"
      description="Try adjusting your search or filters."
      actions={
        <>
          <XDSButton label="Go back" variant="secondary" />
          <XDSButton label="Clear filters" variant="primary" />
        </>
      }
    />
  );
}
