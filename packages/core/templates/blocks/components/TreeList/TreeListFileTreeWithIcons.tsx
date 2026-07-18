// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {TreeList} from '@astryxdesign/core/TreeList';
import {Icon} from '@astryxdesign/core/Icon';
import {FolderIcon, DocumentIcon} from '@heroicons/react/24/outline';

export default function TreeListFileTreeWithIcons() {
  return (
    <TreeList
      items={[
        {
          id: 'src',
          label: 'src',
          isExpanded: true,
          startContent: <Icon icon={FolderIcon} size="sm" />,
          children: [
            {
              id: 'app',
              label: 'App.tsx',
              onClick: () => {},
              startContent: <Icon icon={DocumentIcon} size="sm" />,
            },
            {
              id: 'index',
              label: 'index.tsx',
              onClick: () => {},
              startContent: <Icon icon={DocumentIcon} size="sm" />,
            },
          ],
        },
        {
          id: 'pkg',
          label: 'package.json',
          onClick: () => {},
          startContent: <Icon icon={DocumentIcon} size="sm" />,
        },
      ]}
    />
  );
}
