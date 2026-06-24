// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {TabList, Tab} from '@astryxdesign/core/TabList';
import {Badge} from '@astryxdesign/core/Badge';

export default function TabShowcase() {
  return (
    <TabList value="inbox" onChange={() => {}}>
      <Tab
        value="inbox"
        label="Inbox"
        endContent={<Badge label="3" variant="info" />}
      />
    </TabList>
  );
}
