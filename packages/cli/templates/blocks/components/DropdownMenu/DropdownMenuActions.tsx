// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function DropdownMenuActions() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <XDSVStack gap={3}>
      <XDSDropdownMenu
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
        <XDSText type="supporting" color="secondary">
          Last action: {lastAction}
        </XDSText>
      )}
    </XDSVStack>
  );
}
