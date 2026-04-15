'use client';

import {XDSEmptyState} from '@xds/core/EmptyState';

export default function EmptyStateMinimal() {
  return <XDSEmptyState title="No results found" />;
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: EmptyStateMinimal,
};
