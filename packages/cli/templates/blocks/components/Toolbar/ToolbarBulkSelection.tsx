'use client';

import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';

export default function ToolbarBulkSelection() {
  return (
    <XDSToolbar
      label="Bulk actions"
      variant="wash"
      startContent={
        <>
          <XDSBadge label="5 selected" />
          <XDSButton
            label="Delete"
            variant="ghost"
            size="sm"
            icon={
              <svg
                width={16}
                height={16}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M3 4h10M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1m2 0v9a1 1 0 01-1 1H4a1 1 0 01-1-1V4h10z" />
              </svg>
            }
            isIconOnly
          />
          <XDSButton
            label="Archive"
            variant="ghost"
            size="sm"
            icon={
              <svg
                width={16}
                height={16}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round">
                <rect x="1" y="2" width="14" height="3" rx="1" />
                <path d="M2 5v8a1 1 0 001 1h10a1 1 0 001-1V5M6.5 8h3" />
              </svg>
            }
            isIconOnly
          />
        </>
      }
      endContent={<XDSButton label="Deselect all" variant="ghost" size="sm" />}
    />
  );
}
