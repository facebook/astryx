'use client';

import {XDSEmptyState} from '@xds/core/EmptyState';

export default function WithIcon() {
  return (
    <XDSEmptyState
      icon={<span style={{fontSize: '48px'}}>📭</span>}
      title="No messages"
      description="You're all caught up!"
    />
  );
}
