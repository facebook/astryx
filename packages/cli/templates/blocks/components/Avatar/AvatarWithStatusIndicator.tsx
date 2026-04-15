'use client';

import {XDSAvatar, XDSAvatarStatusDot} from '@xds/core/Avatar';

export default function AvatarWithStatusIndicator() {
  return (
    <XDSAvatar
      src="/user.jpg"
      name="John Doe"
      size="medium"
      status={<XDSAvatarStatusDot variant="positive" label="Online" />}
    />
  );
}
