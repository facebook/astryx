'use client';

import {XDSAvatar} from '@xds/core/Avatar';

const SIZES = [
  {size: 'tiny' as const, label: 'Tiny (20px)'},
  {size: 'xsmall' as const, label: 'XSmall (24px)'},
  {size: 'small' as const, label: 'Small (36px)'},
  {size: 'medium' as const, label: 'Medium (48px)'},
  {size: 'large' as const, label: 'Large (128px)'},
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
      {SIZES.map(({size, label}) => (
        <div
          key={size}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}>
          <XDSAvatar
            src={`https://i.pravatar.cc/150?u=${size}`}
            name="Jane Doe"
            size={size}
          />
          <span style={{fontSize: 12, color: '#666'}}>{label}</span>
        </div>
      ))}
    </div>
  );
}
