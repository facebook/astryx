'use client';

import {useState} from 'react';
import {XDSTabList, XDSTab, XDSTabMenu} from '@xds/core/TabList';

export default function TabListTabsWithMenu() {
  const [value, setValue] = useState('home');
  return (
    <XDSTabList value={value} onChange={setValue}>
      <XDSTab value="home" label="Home" />
      <XDSTab value="projects" label="Projects" />
      <XDSTabMenu
        label="More"
        options={[
          {value: 'analytics', label: 'Analytics'},
          {value: 'reports', label: 'Reports'},
          {value: 'billing', label: 'Billing'},
        ]}
      />
    </XDSTabList>
  );
}
