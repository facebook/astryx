'use client';

import {XDSMoreMenu} from '@xds/core/MoreMenu';
import {XDSHStack} from '@xds/core/Layout';
import {XDSHeading} from '@xds/core/Text';

export default function MoreMenuCardHeaderWithOverflowMenu() {
  return (
    // @ts-expect-error migrated example
    <XDSHStack align="center" justify="between">
      <XDSHeading level={3}>Card Title</XDSHeading>
      <XDSMoreMenu
        items={[
          {label: 'Edit', onClick: () => {}},
          {label: 'Duplicate', onClick: () => {}},
          {type: 'divider'},
          {label: 'Delete', onClick: () => {}},
        ]}
      />
    </XDSHStack>
  );
}
