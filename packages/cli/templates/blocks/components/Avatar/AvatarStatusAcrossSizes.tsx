'use client';

import {XDSAvatar, XDSAvatarStatusDot} from '@xds/core/Avatar';

export default function AvatarStatusAcrossSizes() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 24,
        flexWrap: 'wrap',
      }}>
      <XDSAvatar
        src="https://i.pravatar.cc/150?img=30"
        name="Tiny"
        size="tiny"
        status={<XDSAvatarStatusDot variant="positive" label="Online" />}
      />
      <XDSAvatar
        src="https://i.pravatar.cc/150?img=31"
        name="XSmall"
        size="xsmall"
        status={<XDSAvatarStatusDot variant="positive" label="Online" />}
      />
      <XDSAvatar
        src="https://i.pravatar.cc/150?img=32"
        name="Small"
        size="small"
        status={<XDSAvatarStatusDot variant="neutral" label="Away" />}
      />
      <XDSAvatar
        src="https://i.pravatar.cc/150?img=33"
        name="Medium"
        size="medium"
        status={<XDSAvatarStatusDot variant="negative" label="Busy" />}
      />
      <XDSAvatar
        src="https://i.pravatar.cc/150?img=34"
        name="Large"
        size="large"
        status={<XDSAvatarStatusDot variant="positive" label="Online" />}
      />
    </div>
  );
}
