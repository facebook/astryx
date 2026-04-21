'use client';

import {XDSDropdownMenu} from '@xds/core/DropdownMenu';

export default function DropdownMenuWithDisabledItems() {
  return (
    <XDSDropdownMenu
      button={{label: 'Actions'}}
      items={[
        {label: 'Edit', onClick: () => {}},
        {label: 'Duplicate', onClick: () => {}},
        {label: 'Delete (disabled)', isDisabled: true},
      ]}
    />
  );
}
