// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {TreeList} from '@astryxdesign/core/TreeList';
import {Badge} from '@astryxdesign/core/Badge';

const noop = () => {};

export default function TreeListItemBasic() {
  return (
    <TreeList
      items={[
        {
          id: 'inbox',
          label: 'Inbox',
          description: '5 unread messages',
          isExpanded: true,
          endContent: <Badge label="5" variant="info" />,
          children: [
            {id: 'primary', label: 'Primary', isSelected: true, onClick: noop},
            {id: 'updates', label: 'Updates', onClick: noop},
          ],
        },
        {id: 'drafts', label: 'Drafts', onClick: noop},
        {id: 'archive', label: 'Archive', isDisabled: true},
      ]}
    />
  );
}
