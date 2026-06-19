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
        startContent={<XDSAvatar name="Ada Lovelace" size="xsmall" />}
        label="Ada Lovelace"
        description="Design systems engineer"
        endContent={<XDSBadge label="Owner" variant="purple" />}
        onClick={() => {}}
      />
      <XDSItem
        startContent={<XDSAvatar name="Grace Hopper" size="xsmall" />}
        label="Grace Hopper"
        description="Compiler platform"
        endContent={<XDSText color="secondary">Online</XDSText>}
        onClick={() => {}}
      />
      <XDSItem
        startContent={<XDSIcon icon="info" size="sm" color="secondary" />}
        label="Review handoff notes"
        description="Updated guidance is ready for the team"
        endContent={<XDSBadge label="New" variant="blue" />}
        onClick={() => {}}
      />
    </XDSStack>
  );
}
