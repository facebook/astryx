// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Badge} from '@astryxdesign/core/Badge';
import {Icon} from '@astryxdesign/core/Icon';
import {List, ListItem} from '@astryxdesign/core/List';
import {Text} from '@astryxdesign/core/Text';

export default function ListItemWithMetadata() {
  return (
    <List header="Inbox" density="compact" hasDividers>
      <ListItem
        label="Launch checklist"
        description="3 tasks still need an owner"
        startContent={<Icon icon="check" size="sm" color="success" />}
        endContent={<Badge label="3" variant="blue" />}
        isSelected
        onClick={() => {}}
      />
      <ListItem
        label="Security review"
        description="Waiting on approval"
        startContent={<Icon icon="warning" size="sm" color="warning" />}
        endContent={<Text color="secondary">Yesterday</Text>}
        onClick={() => {}}
      />
      <ListItem
        label="Old incident report"
        description="Archived and read-only"
        startContent={<Icon icon="copy" size="sm" color="secondary" />}
        endContent={<Text color="secondary">Apr 12</Text>}
        isDisabled
      />
    </List>
  );
}
