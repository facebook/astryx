'use client';

import {XDSOverflowList} from '@xds/core/OverflowList';
import {XDSButton} from '@xds/core/Button';

export default function OverflowListShowcase() {
  return (
    <div style={{maxWidth: 400, border: '1px dashed #ccc', padding: 8}}>
      <XDSOverflowList
        gap={2}
        overflowRenderer={overflowItems => (
          <XDSButton
            label={`+${overflowItems.length} more`}
            variant="ghost"
            size="sm"
          />
        )}>
        <XDSButton label="Edit" size="sm" />
        <XDSButton label="Duplicate" size="sm" />
        <XDSButton label="Share" size="sm" />
        <XDSButton label="Archive" size="sm" />
        <XDSButton label="Delete" size="sm" />
      </XDSOverflowList>
    </div>
  );
}
