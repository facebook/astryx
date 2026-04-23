'use client';

import {XDSMoreMenu} from '@xds/core/MoreMenu';
import {
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export default function MoreMenuWithSections() {
  return (
    <XDSMoreMenu
      variant="secondary"
      label="Document actions"
      items={[
        {
          type: 'section',
          title: 'Actions',
          items: [
            {label: 'Edit', icon: PencilIcon, onClick: () => {}},
            {
              label: 'Duplicate',
              icon: DocumentDuplicateIcon,
              onClick: () => {},
            },
          ],
        },
        {
          type: 'section',
          title: 'Danger zone',
          items: [{label: 'Delete', icon: TrashIcon, onClick: () => {}}],
        },
      ]}
    />
  );
}
