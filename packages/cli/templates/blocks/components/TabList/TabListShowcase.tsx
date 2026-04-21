'use client';

import {XDSTabList, XDSTab} from '@xds/core/TabList';

export default function TabListShowcase() {
  return (
    <XDSTabList value="home" onChange={() => {}}>
      <XDSTab value="home" label="Home" />
      <XDSTab value="projects" label="Projects" />
      <XDSTab value="settings" label="Settings" />
    </XDSTabList>
  );
}
