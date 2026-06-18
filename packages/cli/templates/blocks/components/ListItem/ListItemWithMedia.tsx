// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Avatar} from '@xds/core/Avatar';
import {Badge} from '@xds/core/Badge';
import {Icon} from '@xds/core/Icon';
import {List, ListItem} from '@xds/core/List';

export default function ListItemWithMedia() {
  return (
    <List header="Team" hasDividers>
      <ListItem
        label="Ada Lovelace"
        description="Design systems engineer"
        startContent={<Avatar name="Ada Lovelace" size="xsmall" />}
        endContent={<Badge label="Owner" variant="purple" />}
        onClick={() => {}}
      />
      <ListItem
        label="Grace Hopper"
        description="Platform infrastructure"
        startContent={<Avatar name="Grace Hopper" size="xsmall" />}
        endContent={<Badge label="On call" variant="blue" />}
        onClick={() => {}}
      />
      <ListItem
        label="Invite teammate"
        description="Send an invitation to collaborate"
        startContent={<Icon icon="info" size="sm" color="secondary" />}
        onClick={() => {}}
      />
    </List>
  );
}
