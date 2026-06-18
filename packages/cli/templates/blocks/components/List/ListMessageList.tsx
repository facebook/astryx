// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {List, ListItem} from '@xds/core/List';
import {Avatar} from '@xds/core/Avatar';
import {Badge} from '@xds/core/Badge';

export default function ListMessageList() {
  return (
    <List hasDividers>
      <ListItem
        label="Alex Johnson"
        description="Hey, are we still on for lunch tomorrow?"
        startContent={<Avatar name="Alex Johnson" size={40} />}
        onClick={() => {}}
        endContent={<Badge label="2" />}
      />
      <ListItem
        label="Sam Rivera"
        description="I pushed the latest changes to the repo"
        startContent={<Avatar name="Sam Rivera" size={40} />}
        onClick={() => {}}
      />
      <ListItem
        label="Jordan Lee"
        description="Can you review the design spec when you get a chance?"
        startContent={<Avatar name="Jordan Lee" size={40} />}
        onClick={() => {}}
        endContent={<Badge label="5" />}
      />
    </List>
  );
}
