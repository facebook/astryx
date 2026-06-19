// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {EmptyState} from '@xds/core/EmptyState';
import {Button} from '@xds/core/Button';
import {Icon} from '@xds/core/Icon';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

export default function EmptyStateShowcase() {
  return (
    <EmptyState
      icon={<Icon icon={MagnifyingGlassIcon} size="lg" />}
      title="No results found"
      description="Try adjusting your search or filters to find what you need."
      actions={<Button label="Clear filters" variant="secondary" />}
    />
  );
}
