'use client';

import {XDSList, XDSListItem} from '@xds/core/List';

export default function ListOrderedSteps() {
  return (
    <XDSList listStyle="decimal">
      <XDSListItem
        label="Install the package"
        description="npm install @xds/core"
      />
      <XDSListItem
        label="Import components"
        description="import { XDSList } from '@xds/core'"
      />
      <XDSListItem
        label="Start building"
        description="Use components in your app"
      />
    </XDSList>
  );
}
