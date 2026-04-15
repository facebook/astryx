'use client';

import {XDSDropdownMenu} from '@xds/core/DropdownMenu';

export default function DropdownMenuBasicUsage() {
  return (
    <XDSDropdownMenu
      button={{label: 'Actions'}}
      items={[
        {label: 'Edit', onClick: () => console.log('edit')},
        {label: 'Delete', onClick: () => console.log('delete')},
      ]}
    />
  );
}
