// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {EmptyState} from '@xds/core/EmptyState';
import {Button} from '@xds/core/Button';
import {Icon} from '@xds/core/Icon';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

export default function EmptyStateActions() {
  return (
    <EmptyState
      icon={<Icon icon={MagnifyingGlassIcon} size="lg" />}
      title="No results found"
      description="Try adjusting your search terms or clearing filters to see more results."
      actions={
        <>
          <Button label="Go back" variant="secondary" />
          <Button label="Clear filters" variant="primary" />
        </>
      }
    />
  );
}
