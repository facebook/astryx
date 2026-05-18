// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSTreeList} from '@xds/core/TreeList';
import {XDSIcon} from '@xds/core/Icon';
import {FolderIcon, DocumentIcon} from '@heroicons/react/24/outline';

export default function TreeListFileTreeWithIcons() {
  return (
    <XDSTreeList
      items={[
        {
          id: 'src',
          label: 'src',
          isExpanded: true,
          startContent: <XDSIcon icon={FolderIcon} size="sm" />,
          children: [
            {
              id: 'app',
              label: 'App.tsx',
              onClick: () => {},
              startContent: <XDSIcon icon={DocumentIcon} size="sm" />,
            },
            {
              id: 'index',
              label: 'index.tsx',
              onClick: () => {},
              startContent: <XDSIcon icon={DocumentIcon} size="sm" />,
            },
          ],
        },
        {
          id: 'pkg',
          label: 'package.json',
          onClick: () => {},
          startContent: <XDSIcon icon={DocumentIcon} size="sm" />,
        },
      ]}
    />
  );
}
