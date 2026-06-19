// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {TreeList} from '@xds/core/TreeList';
import {Badge} from '@xds/core/Badge';

const noop = () => {};

export default function TreeListMailboxTree() {
  return (
    <TreeList
      items={[
        {
          id: 'inbox',
          label: 'Inbox',
          isExpanded: true,
          endContent: <Badge label="3" />,
          children: [
            {
              id: 'unread',
              label: 'Unread',
              onClick: noop,
              endContent: <Badge label="3" />,
            },
            {id: 'starred', label: 'Starred', onClick: noop},
          ],
        },
        {id: 'sent', label: 'Sent', onClick: noop},
        {
          id: 'drafts',
          label: 'Drafts',
          onClick: noop,
          endContent: <Badge label="1" />,
        },
      ]}
    />
  );
}
