'use client';

import {XDSOverflowList} from '@xds/core/OverflowList';
import {XDSButton} from '@xds/core/Button';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';

const labels = ['Save', 'Edit', 'Share', 'Delete'];

export default function OverflowListOverflowIntoDropdownMenu() {
  return (
    <XDSOverflowList
      overflowRenderer={(overflowItems) => (
        <XDSDropdownMenu
          button={{label: `+${overflowItems.length}`, variant: 'ghost'}}
          items={overflowItems.map(({index}) => ({label: labels[index]}))}
        />
      )}>
      {labels.map((l) => (
        <XDSButton key={l} label={l} />
      ))}
    </XDSOverflowList>
  );
}
