// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {TabList, Tab} from '@xds/core/TabList';
import {Badge} from '@xds/core/Badge';

export default function TabListTabsWithBadge() {
  const [value, setValue] = useState('inbox');
  return (
    <TabList value={value} onChange={setValue}>
      <Tab
        value="inbox"
        label="Inbox"
        endContent={<Badge variant="error" label="5" />}
      />
      <Tab value="sent" label="Sent" />
      <Tab
        value="drafts"
        label="Drafts"
        endContent={<Badge variant="neutral" label="2" />}
      />
    </TabList>
  );
}
