// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSBadge} from '@xds/core/Badge';

export default function TabShowcase() {
  return (
    <XDSTabList value="inbox" onChange={() => {}}>
      <XDSTab
        value="inbox"
        label="Inbox"
        endContent={<XDSBadge label="3" variant="info" />}
      />
    </XDSTabList>
  );
}
