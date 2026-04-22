'use client';

import {useState} from 'react';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSStatusDot} from '@xds/core/StatusDot';

export default function TabListTabsWithStatusDot() {
  const [value, setValue] = useState('production');
  return (
    <XDSTabList value={value} onChange={setValue}>
      <XDSTab
        value="production"
        label="Production"
        endContent={<XDSStatusDot variant="positive" label="Healthy" />}
      />
      <XDSTab
        value="staging"
        label="Staging"
        endContent={<XDSStatusDot variant="warning" label="Degraded" />}
      />
      <XDSTab value="development" label="Development" />
    </XDSTabList>
  );
}
