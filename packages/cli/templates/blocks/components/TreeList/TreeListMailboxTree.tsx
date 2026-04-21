'use client';

import {XDSTreeList} from '@xds/core/TreeList';
import {XDSBadge} from '@xds/core/Badge';

const noop = () => {};

export default function TreeListMailboxTree() {
  return (
    <XDSTreeList
      items={[
        {
          id: 'inbox',
          label: 'Inbox',
          isExpanded: true,
          endContent: <XDSBadge label="3" />,
          children: [
            {
              id: 'unread',
              label: 'Unread',
              onClick: noop,
              endContent: <XDSBadge label="3" />,
            },
            {id: 'starred', label: 'Starred', onClick: noop},
          ],
        },
        {id: 'sent', label: 'Sent', onClick: noop},
        {
          id: 'drafts',
          label: 'Drafts',
          onClick: noop,
          endContent: <XDSBadge label="1" />,
        },
      ]}
    />
  );
}
