'use client';

import {XDSOverflowList} from '@xds/core/OverflowList';
import {XDSButton} from '@xds/core/Button';

export default function OverflowListCollapseFromStartList() {
  return (
    <div style={{maxWidth: 300, border: '1px dashed #ccc', padding: 8}}>
      <XDSOverflowList
        gap={2}
        collapseFrom="start"
        overflowRenderer={overflowItems => (
          <XDSButton
            label={`+${overflowItems.length} more`}
            variant="ghost"
            size="sm"
          />
        )}>
        <XDSButton label="Step 1" size="sm" />
        <XDSButton label="Step 2" size="sm" />
        <XDSButton label="Step 3" size="sm" />
        <XDSButton label="Step 4" size="sm" />
        <XDSButton label="Step 5" size="sm" />
      </XDSOverflowList>
    </div>
  );
}
