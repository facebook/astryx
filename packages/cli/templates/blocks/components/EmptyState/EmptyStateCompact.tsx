'use client';

import {XDSEmptyState} from '@xds/core/EmptyState';
import {XDSButton} from '@xds/core/Button';

export default function EmptyStateCompact() {
  return (
    <XDSEmptyState
      title="No data"
      description="Add some data to get started."
      actions={
        <>
          <XDSButton label="Import" variant="secondary" />
          <XDSButton label="Add item" variant="primary" />
        </>
      }
      isCompact
    />
  );
}
