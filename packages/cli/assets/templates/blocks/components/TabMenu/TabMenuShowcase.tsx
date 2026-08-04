// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {TabList, Tab, TabMenu} from '@astryxdesign/core/TabList';

export default function TabMenuShowcase() {
  const [value, setValue] = useState('settings');
  return (
    <TabList value={value} onChange={setValue}>
      <Tab value="overview" label="Overview" />
      <Tab value="activity" label="Activity" />
      <TabMenu
        label="More"
        options={[
          {value: 'settings', label: 'Settings'},
          {value: 'integrations', label: 'Integrations'},
          {value: 'billing', label: 'Billing'},
        ]}
      />
    </TabList>
  );
}
