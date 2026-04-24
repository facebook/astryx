'use client';

import type {ComponentProps} from 'react';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSBadge} from '@xds/core/Badge';

function InboxIcon(props: ComponentProps<'svg'>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2 12h5l3 8 4-16 3 8h5"
      />
    </svg>
  );
}

function InboxFilledIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M2 12h5l3 8 4-16 3 8h5" stroke="currentColor" strokeWidth={2.5} />
    </svg>
  );
}

export default function TabShowcase() {
  return (
    <XDSTabList value="inbox" onChange={() => {}}>
      <XDSTab
        value="inbox"
        label="Inbox"
        icon={<InboxIcon />}
        selectedIcon={<InboxFilledIcon />}
        endContent={<XDSBadge label="3" variant="info" />}
      />
    </XDSTabList>
  );
}
