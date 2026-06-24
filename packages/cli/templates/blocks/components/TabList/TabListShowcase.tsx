// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {TabList, Tab} from '@astryxdesign/core/TabList';

export default function TabListShowcase() {
  return (
    <TabList value="home" onChange={() => {}}>
      <Tab value="home" label="Home" />
      <Tab value="projects" label="Projects" />
      <Tab value="settings" label="Settings" />
    </TabList>
  );
}
