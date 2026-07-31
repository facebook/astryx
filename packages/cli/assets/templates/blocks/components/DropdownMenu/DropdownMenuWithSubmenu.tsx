// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSubMenu,
} from '@astryxdesign/core/DropdownMenu';
import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

export default function DropdownMenuWithSubmenu() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <VStack gap={3}>
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem
          icon="pencil"
          label="Rename"
          onClick={() => setLastAction('Rename')}
        />
        <DropdownMenuSubMenu icon="folder" label="Move to">
          <DropdownMenuItem
            label="Projects"
            onClick={() => setLastAction('Move to Projects')}
          />
          <DropdownMenuItem
            label="Archive"
            onClick={() => setLastAction('Move to Archive')}
          />
          <DropdownMenuItem
            label="Trash"
            onClick={() => setLastAction('Move to Trash')}
          />
        </DropdownMenuSubMenu>
        <DropdownMenuItem
          icon="trash"
          label="Delete"
          onClick={() => setLastAction('Delete')}
        />
      </DropdownMenu>
      {lastAction && (
        <Text type="supporting" color="secondary">
          Last action: {lastAction}
        </Text>
      )}
    </VStack>
  );
}
