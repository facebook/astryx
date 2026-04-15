'use client';

import {XDSButton} from '@xds/core/Button';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSOverflowList} from '@xds/core/OverflowList';
import {XDSToolbar} from '@xds/core/Toolbar';

const actions = [
  {id: '1', label: 'Cut', onSelect: () => {}},
  {id: '2', label: 'Copy', onSelect: () => {}},
  {id: '3', label: 'Paste', onSelect: () => {}},
];

export default function ToolbarWithXDSOverflowListForResponsiveCollapsing() {
  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSToolbar
      label="Actions"
      startContent={
        <XDSOverflowList
          // @ts-expect-error migrated example
          items={actions}
          // @ts-expect-error migrated example
          renderItem={(action) => (
            <XDSButton key={action.id} label={action.label} variant="ghost" />
          )}
          // @ts-expect-error migrated example
          renderOverflow={(items) => (
            <XDSDropdownMenu
              // @ts-expect-error migrated example
              trigger={<XDSButton label="More" variant="ghost" />}
              // @ts-expect-error migrated example
              items={items.map(a => ({label: a.label, onSelect: a.onSelect}))}
            />
          )}
        />
      }
    />
  );
}

export const showcase = {
  aspectRatio: 16 / 4,
  render: ToolbarWithXDSOverflowListForResponsiveCollapsing,
};
