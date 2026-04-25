'use client';

import {XDSTreeList} from '@xds/core/TreeList';
import {XDSBadge} from '@xds/core/Badge';
import {XDSIcon} from '@xds/core/Icon';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const noop = () => {};

export default function TreeListItemShowcase() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Items with descriptions, icons, badges, and states
        </XDSText>
        <XDSTreeList
          items={[
            {
              id: 'inbox',
              label: 'Inbox',
              description: '12 unread messages',
              startContent: <XDSIcon icon="info" size="sm" />,
              endContent: <XDSBadge label="12" variant="info" />,
              onClick: noop,
            },
            {
              id: 'drafts',
              label: 'Drafts',
              description: '3 draft messages',
              startContent: <XDSIcon icon="clock" size="sm" />,
              onClick: noop,
            },
            {
              id: 'sent',
              label: 'Sent',
              isSelected: true,
              startContent: <XDSIcon icon="check" size="sm" />,
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
      </XDSStack>

      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Nested items with expand/collapse
        </XDSText>
        <XDSTreeList
          items={[
            {
              id: 'src',
              label: 'src',
              isExpanded: true,
              children: [
                {
                  id: 'components',
                  label: 'components',
                  isExpanded: true,
                  children: [
                    {id: 'button', label: 'Button.tsx', onClick: noop},
                    {id: 'input', label: 'Input.tsx', onClick: noop},
                  ],
                },
                {id: 'app', label: 'App.tsx', onClick: noop},
                {id: 'index', label: 'index.tsx', onClick: noop},
              ],
            },
            {
              id: 'tests',
              label: 'tests',
              children: [
                {id: 'button-test', label: 'Button.test.tsx'},
              ],
            },
            {id: 'pkg', label: 'package.json', onClick: noop},
          ]}
        />
      </XDSStack>

      <XDSText type="supporting" color="secondary">
        Note: TreeList is data-driven — items are configured via the items prop.
        There is no composed children API; XDSTreeListItem is an internal rendering detail.
      </XDSText>
    </XDSStack>
  );
}
