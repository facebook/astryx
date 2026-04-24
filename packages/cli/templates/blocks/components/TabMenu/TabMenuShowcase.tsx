'use client';

import {XDSTabList, XDSTab, XDSTabMenu} from '@xds/core/TabList';

export default function TabMenuShowcase() {
  return (
    <XDSTabList value="overview" onChange={() => {}}>
      <XDSTab value="overview" label="Overview" />
      <XDSTab value="activity" label="Activity" />
      <XDSTabMenu
        label="More"
        options={[
          {value: 'settings', label: 'Settings'},
          {value: 'integrations', label: 'Integrations'},
          {value: 'billing', label: 'Billing'},
        ]}
      />
    </XDSTabList>
  );
}
