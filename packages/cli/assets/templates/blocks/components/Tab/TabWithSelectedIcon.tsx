// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {TabList, Tab} from '@astryxdesign/core/TabList';

const StarIcon = (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    width="100%"
    height="100%">
    <path d="m8 1.5 2 4.1 4.5.7-3.3 3.2.8 4.5-4-2.1L4 14l.8-4.5-3.3-3.2 4.5-.7L8 1.5Z" />
  </svg>
);

const SelectedStarIcon = (
  <svg viewBox="0 0 16 16" fill="currentColor" width="100%" height="100%">
    <path d="m8 1.5 2 4.1 4.5.7-3.3 3.2.8 4.5-4-2.1L4 14l.8-4.5-3.3-3.2 4.5-.7L8 1.5Z" />
  </svg>
);

export default function TabWithSelectedIcon() {
  const [value, setValue] = useState('favorites');

  return (
    <TabList value={value} onChange={setValue}>
      <Tab
        value="favorites"
        label="Favorites"
        icon={StarIcon}
        selectedIcon={SelectedStarIcon}
      />
      <Tab value="recent" label="Recent" />
    </TabList>
  );
}
