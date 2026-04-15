'use client';

import {XDSDropdownMenu, XDSDropdownMenuItem} from '@xds/core/DropdownMenu';
import type {XDSDropdownMenuItemData} from '@xds/core/DropdownMenu';

function UserIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const users = [
  {label: 'Alice Johnson', icon: UserIcon},
  {label: 'Bob Smith', icon: UserIcon},
  {label: 'Carol Lee', icon: UserIcon},
];

export default function DropdownMenuCustomItemRendering() {
  return (
    <XDSDropdownMenu
      button={{label: 'Users'}}
      items={users}
      children={(item: XDSDropdownMenuItemData) => (
        <XDSDropdownMenuItem icon={item.icon} label={item.label} />
      )}
    />
  );
}
