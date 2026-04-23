'use client';

import {XDSEmptyState} from '@xds/core/EmptyState';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

export default function EmptyStateShowcase() {
  return (
    <XDSEmptyState
      icon={<XDSIcon icon={MagnifyingGlassIcon} size="lg" />}
      title="No results found"
      description="Try adjusting your search or filters to find what you need."
      actions={<XDSButton label="Clear filters" variant="secondary" />}
    />
  );
}
