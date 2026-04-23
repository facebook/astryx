'use client';

import {XDSKbd} from '@xds/core/Kbd';
import {XDSCard} from '@xds/core/Card';
import {XDSList, XDSListItem} from '@xds/core/List';

const menuItems = [
  {label: 'Cut', keys: 'mod+x'},
  {label: 'Copy', keys: 'mod+c'},
  {label: 'Paste', keys: 'mod+v'},
  {label: 'Undo', keys: 'mod+z'},
  {label: 'Redo', keys: 'mod+shift+z'},
] as const;

export default function KbdMenuShortcuts() {
  return (
    <XDSCard padding={0}>
      <XDSList density="compact">
        {menuItems.map(item => (
          <XDSListItem
            key={item.label}
            label={item.label}
            endContent={<XDSKbd keys={item.keys} />}
          />
        ))}
      </XDSList>
    </XDSCard>
  );
}
