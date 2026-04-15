'use client';

import {XDSButton} from '@xds/core/Button';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSOverflowList} from '@xds/core/OverflowList';
import {XDSToolbar} from '@xds/core/Toolbar';

export default function ToolbarWithXDSOverflowListForResponsiveCollapsing() {
  return (
    <XDSToolbar
      label="Actions"
      startContent={
        <XDSOverflowList
          items={actions}
          renderItem={(action) => (
            <XDSButton key={action.id} label={action.label} variant="ghost" />
          )}
          renderOverflow={(items) => (
            <XDSDropdownMenu
              trigger={<XDSButton label="More" variant="ghost" />}
              items={items.map(a => ({label: a.label, onSelect: a.onSelect}))}
            />
          )}
        />
      }
    />
  );
}
