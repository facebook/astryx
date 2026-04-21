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
            {label: 'New File', onClick: () => {}},
            {label: 'New Folder', onClick: () => {}},
          ],
        },
        {
          type: 'section',
          title: 'Share',
          items: [
            {label: 'Share', onClick: () => {}},
            {label: 'Archive', onClick: () => {}},
          ],
        },
      ]}
    />
  );
}
