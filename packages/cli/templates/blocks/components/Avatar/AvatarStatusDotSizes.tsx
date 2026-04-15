'use client';

import {XDSAvatar, XDSAvatarStatusDot} from '@xds/core/Avatar';

export default function AvatarStatusDotSizes() {
  return (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <XDSAvatar name="AB" size="tiny" status={<XDSAvatarStatusDot />} />
      <XDSAvatar name="CD" size="large" status={<XDSAvatarStatusDot />} />
    </div>
  );
}
