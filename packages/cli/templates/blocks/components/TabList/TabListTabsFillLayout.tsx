'use client';

import {useState} from 'react';
import {XDSTabList, XDSTab} from '@xds/core/TabList';

export default function TabListTabsFillLayout() {
  const [value, setValue] = useState('home');
  return (
    <div style={{width: 500}}>
      <XDSTabList value={value} onChange={setValue} layout="fill" hasDivider>
        <XDSTab value="home" label="Home" />
        <XDSTab value="projects" label="Projects" />
        <XDSTab value="settings" label="Settings" />
      </XDSTabList>
    </div>
  );
}
