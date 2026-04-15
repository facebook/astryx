'use client';

import {XDSDropdownMenu} from '@xds/core/DropdownMenu';

export default function DropdownMenuWithSections() {
  return (
    <XDSDropdownMenu
      button={{label: 'File', variant: 'ghost'}}
      items={[
        {
          type: 'section',
          title: 'Create',
          items: [
            {label: 'New File', onClick: () => console.log('new file')},
            {label: 'New Folder', onClick: () => console.log('new folder')},
          ],
        },
        {
          type: 'section',
          title: 'Manage',
          items: [
            {label: 'Rename', onClick: () => console.log('rename')},
            {label: 'Delete', isDisabled: true},
          ],
        },
      ]}
    />
  );
}
