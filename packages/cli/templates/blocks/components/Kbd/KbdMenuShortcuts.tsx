'use client';

import {XDSKbd} from '@xds/core/Kbd';
import {XDSText} from '@xds/core/Text';

const menuItems = [
  {label: 'Cut', keys: 'mod+x'},
  {label: 'Copy', keys: 'mod+c'},
  {label: 'Paste', keys: 'mod+v'},
  {label: 'Undo', keys: 'mod+z'},
  {label: 'Redo', keys: 'mod+shift+z'},
] as const;

export default function KbdMenuShortcuts() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: 8,
        border: '1px solid #e0e0e0',
        borderRadius: 8,
        width: 250,
      }}>
      {menuItems.map((item) => (
        <div
          key={item.label}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 8,
          }}>
          <XDSText type="body">{item.label}</XDSText>
          <XDSKbd keys={item.keys} />
        </div>
      ))}
    </div>
  );
}
