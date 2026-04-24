'use client';

import {XDSTreeList} from '@xds/core/TreeList';
import {XDSBadge} from '@xds/core/Badge';

const noop = () => {};

export default function TreeListItemShowcase() {
  return (
    <XDSTreeList
      items={[
        {
          id: 'inbox',
          label: 'Inbox',
          description: '12 unread messages',
          endContent: <XDSBadge label="12" variant="info" />,
          onClick: noop,
        },
        {
          id: 'drafts',
          label: 'Drafts',
          description: '3 draft messages',
          onClick: noop,
        },
        {
          id: 'sent',
          label: 'Sent',
          isSelected: true,
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
        },
      ]}
    />
  );
}
