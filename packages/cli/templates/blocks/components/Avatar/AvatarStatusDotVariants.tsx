'use client';

import {XDSAvatar, XDSAvatarStatusDot} from '@xds/core/Avatar';

export default function AvatarStatusDotVariants() {
  return (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <XDSAvatar
        name="EF"
        status={<XDSAvatarStatusDot variant="negative" label="Busy" />}
      />
      <XDSAvatar
        name="GH"
        status={<XDSAvatarStatusDot variant="neutral" label="Away" />}
      />
    </div>
  );
}
