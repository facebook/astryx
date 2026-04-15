'use client';

import {XDSMoreMenu} from '@xds/core/MoreMenu';
import {XDSDropdownMenuItem} from '@xds/core/DropdownMenu';
import type {XDSDropdownMenuItemData} from '@xds/core/DropdownMenu';

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

const actions = [
  {label: 'Edit', icon: PencilIcon, onClick: () => {}},
  {label: 'Delete', icon: TrashIcon, onClick: () => {}},
];

export default function MoreMenuCustomItemRendering() {
  return (
    <XDSMoreMenu
      label="User actions"
      items={actions}
      children={(item: XDSDropdownMenuItemData) => (
        <XDSDropdownMenuItem icon={item.icon} label={item.label} />
      )}
    />
  );
}
