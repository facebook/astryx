'use client';

import {XDSDropdownMenu} from '@xds/core/DropdownMenu';

export default function DropdownMenuNoChevron() {
  return (
    <XDSDropdownMenu
      button={{label: 'Sort by: Name', variant: 'ghost'}}
      hasChevron={false}
      items={[
        {label: 'Name', onClick: () => {}},
        {label: 'Date', onClick: () => {}},
        {label: 'Size', onClick: () => {}},
      ]}
    />
  );
}
