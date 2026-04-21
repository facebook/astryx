'use client';

import {XDSAvatar, XDSAvatarStatusDot} from '@xds/core/Avatar';

const USERS = [
  {
    name: 'Alice Chen',
    role: 'Engineering Lead',
    img: 40,
    variant: 'positive' as const,
  },
  {
    name: 'Bob Smith',
    role: 'Product Designer',
    img: 41,
    variant: 'neutral' as const,
  },
  {
    name: 'Carol Davis',
    role: 'Engineering Manager',
    img: 42,
    variant: 'negative' as const,
  },
];

export default function AvatarUserCard() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {USERS.map(user => (
        <div
          key={user.name}
          style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <XDSAvatar
            src={`https://i.pravatar.cc/150?img=${user.img}`}
            name={user.name}
            size="medium"
            status={
              <XDSAvatarStatusDot variant={user.variant} label={user.variant} />
            }
          />
          <div>
            <div style={{fontWeight: 600, fontSize: 14}}>{user.name}</div>
            <div style={{fontSize: 13, color: '#666'}}>{user.role}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
