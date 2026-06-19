// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {TabList, Tab} from '@xds/core/TabList';
import {StatusDot} from '@xds/core/StatusDot';

export default function TabListTabsWithStatusDot() {
  const [value, setValue] = useState('production');
  return (
    <TabList value={value} onChange={setValue}>
      <Tab
        value="production"
        label="Production"
        endContent={<StatusDot variant="success" label="Healthy" />}
      />
      <Tab
        value="staging"
        label="Staging"
        endContent={<StatusDot variant="warning" label="Degraded" />}
      />
      <Tab value="development" label="Development" />
    </TabList>
  );
}
