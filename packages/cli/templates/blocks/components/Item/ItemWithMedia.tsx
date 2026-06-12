// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSAvatar} from '@xds/core/Avatar';
import {XDSBadge} from '@xds/core/Badge';
import {XDSIcon} from '@xds/core/Icon';
import {XDSItem} from '@xds/core/Item';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ItemWithMedia() {
  return (
    <XDSStack gap={0}>
      <XDSItem
        media={<XDSAvatar name="Ada Lovelace" size="xsmall" />}
        label="Ada Lovelace"
        description="Design systems engineer"
        trailing={<XDSBadge label="Owner" variant="purple" />}
        onClick={() => {}}
      />
      <XDSItem
        media={<XDSAvatar name="Grace Hopper" size="xsmall" />}
        label="Grace Hopper"
        description="Compiler platform"
        trailing={<XDSText color="secondary">Online</XDSText>}
        onClick={() => {}}
      />
      <XDSItem
        media={<XDSIcon icon="info" size="sm" color="secondary" />}
        label="Review handoff notes"
        description="Updated guidance is ready for the team"
        trailing={<XDSBadge label="New" variant="blue" />}
        onClick={() => {}}
      />
    </XDSStack>
  );
}
