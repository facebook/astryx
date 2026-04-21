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
        name="Alice Chen"
        size="tiny"
        status={<XDSAvatarStatusDot variant="positive" label="Online" />}
      />
      <XDSAvatar
        name="Bob Smith"
        size="xsmall"
        status={<XDSAvatarStatusDot variant="positive" label="Online" />}
      />
      <XDSAvatar
        name="Carol Davis"
        size="small"
        status={<XDSAvatarStatusDot variant="neutral" label="Away" />}
      />
      <XDSAvatar
        name="Dan Wilson"
        size="medium"
        status={<XDSAvatarStatusDot variant="negative" label="Busy" />}
      />
      <XDSAvatar
        name="Eve Park"
        size="large"
        status={<XDSAvatarStatusDot variant="positive" label="Online" />}
      />
    </div>
  );
}
