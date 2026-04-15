'use client';

import {XDSEmptyState} from '@xds/core/EmptyState';
import {XDSIcon} from '@xds/core/Icon';
import {XDSButton} from '@xds/core/Button';

function InboxIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

export default function EmptyStateFullExample() {
  return (
    <XDSEmptyState
      icon={<XDSIcon icon={InboxIcon} size="lg" />}
      title="No messages"
      description="You're all caught up!"
      actions={<XDSButton label="Compose" variant="primary" />}
    />
  );
}
