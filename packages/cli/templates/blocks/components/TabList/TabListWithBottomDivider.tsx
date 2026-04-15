'use client';

import {useState} from 'react';
import {XDSTab, XDSTabList} from '@xds/core/TabList';

export default function TabListWithBottomDivider() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <XDSTabList value={activeTab} onChange={setActiveTab} hasDivider>
      <XDSTab value="home" label="Home" />
      <XDSTab value="settings" label="Settings" />
    </XDSTabList>
  );
}
