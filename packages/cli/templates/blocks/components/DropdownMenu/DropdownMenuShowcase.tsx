'use client';

import {XDSDropdownMenu} from '@xds/core/DropdownMenu';

export default function DropdownMenuShowcase() {
  return (
    <XDSDropdownMenu
      button={{label: 'Actions'}}
      items={[
        {label: 'Edit', onClick: () => {}},
        {label: 'Duplicate', onClick: () => {}},
        {label: 'Delete', onClick: () => {}},
      ]}
    />
  );
}
