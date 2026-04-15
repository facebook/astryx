'use client';

import {useState} from 'react';
import {XDSTab, XDSTabList} from '@xds/core/TabList';

export default function TabListWithLinks() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <XDSTabList value={activeTab} onChange={setActiveTab}>
      <XDSTab value="home" label="Home" href="/home" />
      <XDSTab value="settings" label="Settings" href="/settings" />
    </XDSTabList>
  );
}
