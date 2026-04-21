'use client';

import {XDSList, XDSListItem} from '@xds/core/List';

export default function ListBulletedFeatures() {
  return (
    <XDSList listStyle="disc">
      <XDSListItem label="Accessible by default" />
      <XDSListItem label="Themeable with StyleX" />
      <XDSListItem label="Composable and extensible" />
    </XDSList>
  );
}
