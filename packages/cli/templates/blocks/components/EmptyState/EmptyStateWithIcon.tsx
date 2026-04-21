'use client';

import {XDSEmptyState} from '@xds/core/EmptyState';

export default function EmptyStateWithIcon() {
  return (
    <XDSEmptyState
      icon={<span style={{fontSize: '48px'}}>📭</span>}
      title="No messages"
      description="You're all caught up!"
    />
  );
}
