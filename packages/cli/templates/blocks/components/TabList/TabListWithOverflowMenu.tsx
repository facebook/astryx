'use client';

import {useState} from 'react';
import {XDSTab, XDSTabList, XDSTabMenu} from '@xds/core/TabList';

function ChartBarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function DocumentTextIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export default function TabListWithOverflowMenu() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <XDSTabList value={activeTab} onChange={setActiveTab}>
      <XDSTab value="home" label="Home" />
      <XDSTab value="settings" label="Settings" />
      <XDSTabMenu
        label="More"
        options={[
          {value: 'analytics', label: 'Analytics', icon: ChartBarIcon},
          {value: 'reports', label: 'Reports', icon: DocumentTextIcon},
        ]}
      />
    </XDSTabList>
  );
}
