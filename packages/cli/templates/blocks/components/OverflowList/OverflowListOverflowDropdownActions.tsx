'use client';

import {XDSOverflowList} from '@xds/core/OverflowList';
import {XDSButton} from '@xds/core/Button';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';

const actions = ['Save', 'Edit', 'Duplicate', 'Share', 'Archive', 'Delete'];

export default function OverflowListOverflowDropdownActions() {
  return (
    <div
      style={{
        resize: 'horizontal',
        overflow: 'hidden',
        border: '1px dashed #ccc',
        padding: 8,
        width: 350,
        minWidth: 100,
        maxWidth: '100%',
      }}>
      <XDSOverflowList
        gap={2}
        overflowRenderer={overflowItems => (
          <XDSDropdownMenu
            button={{
              label: `+${overflowItems.length}`,
              variant: 'ghost',
              size: 'sm',
            }}
            items={overflowItems.map(({index}) => ({
              label: actions[index],
              onClick: () => {},
            }))}
          />
        )}>
        <XDSButton label="Save" size="sm" variant="primary" />
        <XDSButton label="Edit" size="sm" />
        <XDSButton label="Duplicate" size="sm" />
        <XDSButton label="Share" size="sm" />
        <XDSButton label="Archive" size="sm" />
        <XDSButton label="Delete" size="sm" variant="destructive" />
      </XDSOverflowList>
    </div>
  );
}
