'use client';

import {useState} from 'react';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSButton} from '@xds/core/Button';

const FilterIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    width="100%"
    height="100%">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
    />
  </svg>
);

const PlusIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    width="100%"
    height="100%">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);

export default function TabListTabsWithActions() {
  const [value, setValue] = useState('all');
  return (
    <XDSTabList value={value} onChange={setValue} size="lg" hasDivider>
      <XDSTab value="all" label="All items" />
      <XDSTab value="active" label="Active" />
      <XDSTab value="archived" label="Archived" />
      <div
        style={{
          marginInlineStart: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
        <XDSButton
          label="Filter"
          variant="ghost"
          size="sm"
          icon={FilterIcon}
          isIconOnly
        />
        <XDSButton
          label="New item"
          variant="primary"
          size="sm"
          icon={PlusIcon}
        />
      </div>
    </XDSTabList>
  );
}
