'use client';

import {XDSDropdownMenu} from '@xds/core/DropdownMenu';

export default function DropdownMenuShowcase() {
  return (
    <XDSDropdownMenu
      trigger={<button>Menu</button>}
      items={[{label: 'Edit'}]}
    />
  );
}
