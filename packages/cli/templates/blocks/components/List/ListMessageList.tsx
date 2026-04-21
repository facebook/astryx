'use client';

import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSBadge} from '@xds/core/Badge';

export default function ListMessageList() {
  return (
    <XDSList hasDividers>
      <XDSListItem
        label="Alex Johnson"
        description="Hey, are we still on for lunch tomorrow?"
        startContent={<XDSAvatar name="Alex Johnson" size={40} />}
        onClick={() => {}}
        endContent={<XDSBadge label="2" />}
      />
      <XDSListItem
        label="Sam Rivera"
        description="I pushed the latest changes to the repo"
        startContent={<XDSAvatar name="Sam Rivera" size={40} />}
        onClick={() => {}}
      />
      <XDSListItem
        label="Jordan Lee"
        description="Can you review the design spec when you get a chance?"
        startContent={<XDSAvatar name="Jordan Lee" size={40} />}
        onClick={() => {}}
        endContent={<XDSBadge label="5" />}
      />
    </XDSList>
  );
}
