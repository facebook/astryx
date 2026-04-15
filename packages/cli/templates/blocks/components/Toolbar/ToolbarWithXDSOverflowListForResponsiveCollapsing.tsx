'use client';

import {XDSButton} from '@xds/core/Button';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSOverflowList} from '@xds/core/OverflowList';
import {XDSToolbar} from '@xds/core/Toolbar';

const actions = [
  {id: '1', label: 'Cut', onClick: () => {}},
  {id: '2', label: 'Copy', onClick: () => {}},
  {id: '3', label: 'Paste', onClick: () => {}},
];

export default function ToolbarWithXDSOverflowListForResponsiveCollapsing() {
  return (
    <XDSToolbar
      label="Actions"
      startContent={
        <XDSOverflowList
          overflowRenderer={(overflowItems) => (
            <XDSDropdownMenu
              button={{label: 'More', variant: 'ghost'}}
              items={overflowItems.map(({index}) => ({
                label: actions[index].label,
                onClick: actions[index].onClick,
              }))}
            />
          )}>
          {actions.map((action) => (
            <XDSButton
              key={action.id}
              label={action.label}
              variant="ghost"
            />
          ))}
        </XDSOverflowList>
      }
    />
  );
}
