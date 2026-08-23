// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

export default function DropdownMenuActions() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <VStack gap={3}>
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[
          {label: 'Edit', onClick: () => setLastAction('Edit')},
          {label: 'Duplicate', onClick: () => setLastAction('Duplicate')},
          {label: 'Move to folder', onClick: () => setLastAction('Move')},
          {type: 'divider'},
          {label: 'Archive', onClick: () => setLastAction('Archive')},
          {label: 'Delete', onClick: () => setLastAction('Delete')},
        ]}
      />
      {lastAction && (
        <Text type="supporting" color="secondary">
          Last action: {lastAction}
        </Text>
      )}
    </VStack>
  );
}
