'use client';

import {useState} from 'react';
import {XDSTab, XDSTabList} from '@xds/core/TabList';

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function HomeFilledIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function CogIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export default function TabListWithIcons() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <XDSTabList value={activeTab} onChange={setActiveTab}>
      <XDSTab value="home" label="Home" icon={<HomeIcon />} selectedIcon={<HomeFilledIcon />} />
      <XDSTab value="settings" label="Settings" icon={<CogIcon />} />
    </XDSTabList>
  );
}
