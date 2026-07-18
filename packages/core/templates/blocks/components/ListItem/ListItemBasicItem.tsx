// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {List, ListItem} from '@astryxdesign/core/List';

export default function ListItemBasicItem() {
  return (
    <List header="Account settings" hasDividers>
      <ListItem label="Profile" description="Name, avatar, and bio" />
      <ListItem label="Notifications" description="Email and push alerts" />
      <ListItem
        label="Security"
        description="Password and two-factor auth"
      />
    </List>
  );
}
