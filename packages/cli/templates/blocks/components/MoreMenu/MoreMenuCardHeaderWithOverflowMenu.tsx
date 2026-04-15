'use client';

import {XDSMoreMenu} from '@xds/core/MoreMenu';
import {XDSHStack} from '@xds/core/Layout';
import {XDSHeading} from '@xds/core/Text';

export default function MoreMenuCardHeaderWithOverflowMenu() {
  return (
    <XDSHStack vAlign="center" hAlign="between">
      <XDSHeading level={3}>Card Title</XDSHeading>
      <XDSMoreMenu
        items={[
          {label: 'Edit', onClick: () => {}},
          {label: 'Duplicate', onClick: () => {}},
          {type: 'divider' as const},
          {label: 'Delete', onClick: () => {}},
        ]}
      />
    </XDSHStack>
  );
}
