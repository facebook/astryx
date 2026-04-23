'use client';

import {XDSMoreMenu} from '@xds/core/MoreMenu';
import {
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export default function MoreMenuWithDividers() {
  return (
    <XDSMoreMenu
      variant="secondary"
      items={[
        {label: 'Edit', icon: PencilIcon, onClick: () => {}},
        {label: 'Duplicate', icon: DocumentDuplicateIcon, onClick: () => {}},
        {type: 'divider'},
        {label: 'Delete', icon: TrashIcon, onClick: () => {}},
      ]}
    />
  );
}
