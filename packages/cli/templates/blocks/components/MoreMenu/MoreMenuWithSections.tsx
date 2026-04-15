'use client';

import {XDSMoreMenu} from '@xds/core/MoreMenu';

export default function MoreMenuWithSections() {
  return (
    <XDSMoreMenu
      label="Document actions"
      items={[
        {
          type: 'section',
          title: 'Actions',
          items: [
            {label: 'Edit', onClick: () => {}},
            {label: 'Duplicate', onClick: () => {}},
          ],
        },
        {
          type: 'section',
          title: 'Danger zone',
          items: [{label: 'Delete', onClick: () => {}}],
        },
      ]}
    />
  );
}
