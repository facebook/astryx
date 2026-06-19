// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Avatar} from '@xds/core/Avatar';
import {Badge} from '@xds/core/Badge';
import {Icon} from '@xds/core/Icon';
import {Item} from '@xds/core/Item';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

export default function ItemWithMedia() {
  return (
    <Stack gap={0}>
      <Item
        startContent={<Avatar name="Ada Lovelace" size="xsmall" />}
        label="Ada Lovelace"
        description="Design systems engineer"
        endContent={<Badge label="Owner" variant="purple" />}
        onClick={() => {}}
      />
      <Item
        startContent={<Avatar name="Grace Hopper" size="xsmall" />}
        label="Grace Hopper"
        description="Compiler platform"
        endContent={<Text color="secondary">Online</Text>}
        onClick={() => {}}
      />
      <Item
        startContent={<Icon icon="info" size="sm" color="secondary" />}
        label="Review handoff notes"
        description="Updated guidance is ready for the team"
        endContent={<Badge label="New" variant="blue" />}
        onClick={() => {}}
      />
    </Stack>
  );
}
