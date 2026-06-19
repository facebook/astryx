// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {TabList, Tab, TabMenu} from '@xds/core/TabList';

export default function TabMenuShowcase() {
  return (
    <TabList value="settings" onChange={() => {}}>
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
