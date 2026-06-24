// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {TreeList} from '@astryxdesign/core/TreeList';
import {Badge} from '@astryxdesign/core/Badge';
import {Icon} from '@astryxdesign/core/Icon';

const noop = () => {};

export default function TreeListItemShowcase() {
  return (
    <TreeList
      style={{width: 400}}
      items={[
        {
          id: 'inbox',
          label: 'Inbox',
          description: '12 unread messages',
          isExpanded: true,
          startContent: <Icon icon="info" size="sm" />,
          endContent: <Badge label="12" variant="info" />,
          children: [
            {
              id: 'primary',
              label: 'Primary',
              isSelected: true,
              startContent: <Icon icon="check" size="sm" />,
              onClick: noop,
            },
            {
              id: 'updates',
              label: 'Updates',
              endContent: <Badge label="4" variant="info" />,
              onClick: noop,
            },
          ],
        },
        {
          id: 'drafts',
          label: 'Drafts',
          description: '3 draft messages',
          startContent: <Icon icon="clock" size="sm" />,
          onClick: noop,
        },
        {
          id: 'archive',
          label: 'Archive',
          onClick: noop,
        },
        {
          id: 'spam',
          label: 'Spam',
          isDisabled: true,
          startContent: <Icon icon="warning" size="sm" />,
        },
      ]}
    />
  );
}
