// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function DropdownMenuWithSections() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <XDSVStack gap={3}>
      <XDSDropdownMenu
        button={{label: 'File', variant: 'ghost'}}
        items={[
          {
            type: 'section',
            title: 'Create',
            items: [
              {
                label: 'New document',
                onClick: () => setLastAction('New document'),
              },
              {
                label: 'New spreadsheet',
                onClick: () => setLastAction('New spreadsheet'),
              },
              {label: 'New folder', onClick: () => setLastAction('New folder')},
            ],
          },
          {
            type: 'section',
            title: 'Manage',
            items: [
              {label: 'Share', onClick: () => setLastAction('Share')},
              {label: 'Move', onClick: () => setLastAction('Move')},
              {label: 'Archive', onClick: () => setLastAction('Archive')},
            ],
          },
        ]}
      />
      {lastAction && (
        <XDSText type="supporting" color="secondary">
          Selected: {lastAction}
        </XDSText>
      )}
    </XDSVStack>
  );
}
