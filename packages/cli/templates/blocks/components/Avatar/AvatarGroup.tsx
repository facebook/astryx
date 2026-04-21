'use client';

import {XDSAvatar} from '@xds/core/Avatar';

const USERS = [
  'Alice Chen',
  'Bob Smith',
  'Carol Davis',
  'Dan Wilson',
  'Eve Park',
];

export default function AvatarGroup() {
  const overlapOffset = -10;

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 32}}>
      <div>
        <p style={{margin: '0 0 12px', fontSize: 13, color: '#666'}}>
          Team members
        </p>
        <div style={{display: 'flex', alignItems: 'center'}}>
          {USERS.map((name, i) => (
            <div
              key={name}
              style={{
                marginLeft: i === 0 ? 0 : overlapOffset,
                borderRadius: '50%',
                border: '2px solid var(--color-background-surface, #fff)',
              }}>
              <XDSAvatar name={name} size="small" />
            </div>
          ))}
          <div
            style={{
              marginLeft: overlapOffset,
              borderRadius: '50%',
              border: '2px solid var(--color-background-surface, #fff)',
            }}>
            <XDSAvatar name="+3" size="small" />
          </div>
        </div>
      </div>
      <div>
        <p style={{margin: '0 0 12px', fontSize: 13, color: '#666'}}>
          Larger group
        </p>
        <div style={{display: 'flex', alignItems: 'center'}}>
          {USERS.slice(0, 3).map((name, i) => (
            <div
              key={name}
              style={{
                marginLeft: i === 0 ? 0 : -14,
                borderRadius: '50%',
                border: '2px solid var(--color-background-surface, #fff)',
              }}>
              <XDSAvatar name={name} size="medium" />
            </div>
          ))}
          <div
            style={{
              marginLeft: -14,
              borderRadius: '50%',
              border: '2px solid var(--color-background-surface, #fff)',
            }}>
            <XDSAvatar name="+8" size="medium" />
          </div>
        </div>
      </div>
    </div>
  );
}
