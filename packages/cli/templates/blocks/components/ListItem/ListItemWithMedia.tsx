// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSAvatar} from '@xds/core/Avatar';
import {XDSBadge} from '@xds/core/Badge';
import {XDSIcon} from '@xds/core/Icon';
import {XDSList, XDSListItem} from '@xds/core/List';

export default function ListItemWithMedia() {
  return (
    <XDSList header="Team" hasDividers>
      <XDSListItem
        label="Ada Lovelace"
        description="Design systems engineer"
        startContent={<XDSAvatar name="Ada Lovelace" size="xsmall" />}
        endContent={<XDSBadge label="Owner" variant="purple" />}
        onClick={() => {}}
      />
      <XDSListItem
        label="Grace Hopper"
        description="Platform infrastructure"
        startContent={<XDSAvatar name="Grace Hopper" size="xsmall" />}
        endContent={<XDSBadge label="On call" variant="blue" />}
        onClick={() => {}}
      />
      <XDSListItem
        label="Invite teammate"
        description="Send an invitation to collaborate"
        startContent={<XDSIcon icon="info" size="sm" color="secondary" />}
        onClick={() => {}}
      />
    </XDSList>
  );
}
