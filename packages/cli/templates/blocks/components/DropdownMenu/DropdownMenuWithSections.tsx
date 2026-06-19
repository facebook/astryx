// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {DropdownMenu} from '@xds/core/DropdownMenu';
import {VStack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

export default function DropdownMenuWithSections() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <VStack gap={3}>
      <DropdownMenu
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
        <Text type="supporting" color="secondary">
          Selected: {lastAction}
        </Text>
      )}
    </VStack>
  );
}
