'use client';

import {XDSAvatar, XDSAvatarStatusDot} from '@xds/core/Avatar';

export default function AvatarWithStatus() {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <XDSAvatar
        src="https://i.pravatar.cc/150?img=20"
        name="Online User"
        size="large"
        status={<XDSAvatarStatusDot variant="positive" label="Online" />}
      />
      <XDSAvatar
        src="https://i.pravatar.cc/150?img=21"
        name="Offline User"
        size="large"
        status={<XDSAvatarStatusDot variant="neutral" label="Offline" />}
      />
      <XDSAvatar
        src="https://i.pravatar.cc/150?img=22"
        name="Busy User"
        size="large"
        status={<XDSAvatarStatusDot variant="negative" label="Busy" />}
      />
    </div>
  );
}
