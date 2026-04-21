'use client';

import {XDSEmptyState} from '@xds/core/EmptyState';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

export default function EmptyStateActions() {
  return (
    <XDSEmptyState
      icon={<XDSIcon icon={MagnifyingGlassIcon} size="lg" />}
      title="No results found"
      description="Try adjusting your search terms or clearing filters to see more results."
      actions={
        <>
          <XDSButton label="Go back" variant="secondary" />
          <XDSButton label="Clear filters" variant="primary" />
        </>
      }
    />
  );
}
