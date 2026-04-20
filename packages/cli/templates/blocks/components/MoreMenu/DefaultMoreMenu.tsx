'use client';

import {XDSMoreMenu} from '@xds/core/MoreMenu';

export default function DefaultMoreMenu() {
  return (
    <XDSMoreMenu
      items={[
        {label: 'Edit', onClick: () => {}},
        {label: 'Duplicate', onClick: () => {}},
        {label: 'Delete', onClick: () => {}},
      ]}
    />
  );
}
