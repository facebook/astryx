'use client';

import {XDSList, XDSListItem} from '@xds/core/List';

export default function ListOrdered() {
  return (
    <XDSList listStyle="decimal">
      <XDSListItem label="First step" />
      <XDSListItem label="Second step" />
    </XDSList>
  );
}
