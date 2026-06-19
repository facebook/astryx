// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSList, XDSListItem} from '@xds/core/List';

export default function ListItemBasicItem() {
  return (
    <XDSList header="Account settings" hasDividers>
      <XDSListItem label="Profile" description="Name, avatar, and bio" />
      <XDSListItem label="Notifications" description="Email and push alerts" />
      <XDSListItem
        label="Security"
        description="Password and two-factor auth"
      />
    </XDSList>
  );
}
