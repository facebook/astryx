'use client';

import {XDSMoreMenu} from '@xds/core/MoreMenu';

export default function MoreMenuMinimalActions() {
  return (
    <XDSMoreMenu
      items={[
        {label: 'Edit', onClick: () => {}},
        {label: 'Delete', onClick: () => {}},
      ]}
    />
  );
}
