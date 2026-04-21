'use client';

import {XDSTreeList} from '@xds/core/TreeList';
import {XDSIcon} from '@xds/core/Icon';

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

const noop = () => {};

export default function TreeListFileTreeWithIcons() {
  return (
    <XDSTreeList
      items={[
        {
          id: 'src',
          label: 'src',
          isExpanded: true,
          startContent: <XDSIcon icon={FolderIcon} />,
          children: [
            {
              id: 'app',
              label: 'App.tsx',
              onClick: noop,
              startContent: <XDSIcon icon={DocumentIcon} />,
            },
            {
              id: 'index',
              label: 'index.tsx',
              onClick: noop,
              startContent: <XDSIcon icon={DocumentIcon} />,
            },
          ],
        },
        {
          id: 'pkg',
          label: 'package.json',
          onClick: noop,
          startContent: <XDSIcon icon={DocumentIcon} />,
        },
      ]}
    />
  );
}
