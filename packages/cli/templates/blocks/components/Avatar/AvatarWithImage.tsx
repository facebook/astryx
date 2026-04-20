'use client';

import {XDSAvatar} from '@xds/core/Avatar';

export default function AvatarWithImage() {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <XDSAvatar
        src="https://i.pravatar.cc/150?img=1"
        name="User 1"
        size="tiny"
      />
      <XDSAvatar
        src="https://i.pravatar.cc/150?img=2"
        name="User 2"
        size="small"
      />
      <XDSAvatar
        src="https://i.pravatar.cc/150?img=3"
        name="User 3"
        size="medium"
      />
      <XDSAvatar
        src="https://i.pravatar.cc/150?img=4"
        name="User 4"
        size="large"
      />
    </div>
  );
}
