'use client';

import {XDSEmptyState} from '@xds/core/EmptyState';
import {XDSButton} from '@xds/core/Button';

export default function EmptyStateFullExample() {
  return (
    <div
      style={{
        border: '1px dashed #ccc',
        borderRadius: 12,
        maxWidth: 480,
      }}>
      <XDSEmptyState
        icon={<span style={{fontSize: '48px'}}>📬</span>}
        title="No notifications"
        description="When you receive notifications, they will appear here. Check back later!"
        actions={
          <>
            <XDSButton label="Settings" variant="secondary" />
            <XDSButton label="Refresh" variant="primary" />
          </>
        }
      />
    </div>
  );
}
