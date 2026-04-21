'use client';

import {XDSMoreMenu} from '@xds/core/MoreMenu';

export default function MoreMenuShowcase() {
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
