'use client';

import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSBadge} from '@xds/core/Badge';

export default function TabShowcase() {
  return (
    <XDSTabList value="inbox" onChange={() => {}}>
      <XDSTab value="inbox" label="Inbox" endContent={<XDSBadge label="3" variant="info" />} />
      <XDSTab value="sent" label="Sent" />
      <XDSTab value="drafts" label="Drafts" />
      <XDSTab value="archive" label="Archive" />
    </XDSTabList>
  );
}
