'use client';

import {XDSAvatar} from '@xds/core/Avatar';

const SIZES = [
  {size: 'tiny' as const, label: 'Tiny (20px)', name: 'Alice Chen'},
  {size: 'xsmall' as const, label: 'XSmall (24px)', name: 'Bob Smith'},
  {size: 'small' as const, label: 'Small (36px)', name: 'Carol Davis'},
  {size: 'medium' as const, label: 'Medium (48px)', name: 'Dan Wilson'},
  {size: 'large' as const, label: 'Large (128px)', name: 'Eve Park'},
];

export default function AvatarAllSizes() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 24,
        flexWrap: 'wrap',
      }}>
      {SIZES.map(({size, label, name}) => (
        <div
          key={size}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}>
          <XDSAvatar name={name} size={size} />
          <span style={{fontSize: 12, color: '#666'}}>{label}</span>
        </div>
      ))}
    </div>
  );
}
