// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSIcon} from '@xds/core/Icon';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {EllipsisHorizontalIcon} from '@heroicons/react/24/outline';

export default function DropdownMenuNoChevron() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <XDSVStack gap={3}>
      <XDSDropdownMenu
        button={{
          label: 'More actions',
          icon: <XDSIcon icon={EllipsisHorizontalIcon} />,
          variant: 'ghost',
          isIconOnly: true,
        }}
        hasChevron={false}
        items={[
          {label: 'Copy link', onClick: () => setLastAction('Copy link')},
          {label: 'Download', onClick: () => setLastAction('Download')},
          {label: 'Print', onClick: () => setLastAction('Print')},
          {type: 'divider'},
          {label: 'Report', onClick: () => setLastAction('Report')},
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
