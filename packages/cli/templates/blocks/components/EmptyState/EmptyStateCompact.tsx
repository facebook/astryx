'use client';

import {XDSEmptyState} from '@xds/core/EmptyState';
import {XDSButton} from '@xds/core/Button';
import {XDSHStack} from '@xds/core/Layout';
import {XDSIcon} from '@xds/core/Icon';
import {InboxIcon} from '@heroicons/react/24/outline';

export default function EmptyStateCompact() {
  return (
    <XDSEmptyState
      icon={<XDSIcon icon={InboxIcon} size="lg" />}
      title="No notifications"
      description="You're all caught up. New notifications will appear here."
      actions={
        <XDSHStack gap={2}>
          <XDSButton label="Settings" variant="secondary" size="sm" />
          <XDSButton label="Refresh" variant="primary" size="sm" />
        </XDSHStack>
      }
      isCompact
    />
  );
}
