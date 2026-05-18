// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSTreeList} from '@xds/core/TreeList';
import {XDSIcon} from '@xds/core/Icon';
import {Cog6ToothIcon, ChevronRightIcon} from '@heroicons/react/24/outline';

export default function TreeListInteractiveSettings() {
  return (
    <XDSTreeList
      items={[
        {
          id: 'settings',
          label: 'Settings',
          isExpanded: true,
          startContent: <XDSIcon icon={Cog6ToothIcon} size="sm" />,
          children: [
            {
              id: 'general',
              label: 'General',
              onClick: () => {},
            },
            {
              id: 'advanced',
              label: 'Advanced',
              onClick: () => {},
            },
          ],
        },
        {
          id: 'docs',
          label: 'Documentation',
          href: '#',
          endContent: <XDSIcon icon={ChevronRightIcon} size="sm" />,
        },
      ]}
    />
  );
}
