'use client';

import {XDSTreeList} from '@xds/core/TreeList';
import {XDSBadge} from '@xds/core/Badge';
import {XDSIcon} from '@xds/core/Icon';

const noop = () => {};

export default function TreeListItemShowcase() {
  return (
    <XDSTreeList
      style={{width: 400}}
      items={[
        {
          id: 'inbox',
          label: 'Inbox',
          description: '12 unread messages',
          isExpanded: true,
          startContent: <XDSIcon icon="info" size="sm" />,
          endContent: <XDSBadge label="12" variant="info" />,
          children: [
            {
              id: 'primary',
              label: 'Primary',
              isSelected: true,
              startContent: <XDSIcon icon="check" size="sm" />,
              onClick: noop,
            },
            {
              id: 'updates',
              label: 'Updates',
              endContent: <XDSBadge label="4" variant="info" />,
              onClick: noop,
            },
          ],
        },
        {
          id: 'drafts',
          label: 'Drafts',
          description: '3 draft messages',
          startContent: <XDSIcon icon="clock" size="sm" />,
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
          startContent: <XDSIcon icon="warning" size="sm" />,
        },
      ]}
    />
  );
}
