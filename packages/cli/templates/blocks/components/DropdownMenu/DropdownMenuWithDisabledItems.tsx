// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function DropdownMenuWithDisabledItems() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <XDSVStack gap={3}>
      <XDSDropdownMenu
        button={{label: 'Manage team'}}
        items={[
          {label: 'Invite member', onClick: () => setLastAction('Invite')},
          {label: 'Edit roles', onClick: () => setLastAction('Edit roles')},
          {type: 'divider'},
          {label: 'Transfer ownership', isDisabled: true},
          {label: 'Delete team', isDisabled: true},
        ]}
      />
      {lastAction && (
        <XDSText type="supporting" color="secondary">
          Last action: {lastAction}
        </XDSText>
      )}
      <XDSText type="supporting" color="secondary">
        Destructive actions are disabled for non-admin users
      </XDSText>
    </XDSVStack>
  );
}
