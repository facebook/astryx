'use client';

import {useState} from 'react';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSBadge} from '@xds/core/Badge';

export default function TabListTabsWithBadge() {
  const [value, setValue] = useState('inbox');
  return (
    <XDSTabList value={value} onChange={setValue}>
      <XDSTab
        value="inbox"
        label="Inbox"
        endContent={<XDSBadge variant="error" label="5" />}
      />
      <XDSTab value="sent" label="Sent" />
      <XDSTab
        value="drafts"
        label="Drafts"
        endContent={<XDSBadge variant="neutral" label="2" />}
      />
    </XDSTabList>
  );
}
