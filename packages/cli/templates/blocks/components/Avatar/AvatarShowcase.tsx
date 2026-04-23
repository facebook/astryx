'use client';

import {XDSAvatar, XDSAvatarStatusDot} from '@xds/core/Avatar';
import {XDSStack} from '@xds/core/Layout';

export default function AvatarShowcase() {
  return (
    <XDSStack direction="horizontal" gap={4} vAlign="center">
      <XDSAvatar name="Alex Kim" size="xsmall" />
      <XDSAvatar name="Jordan Lee" size="small" />
      <XDSAvatar name="Sam Chen" size="medium" />
      <XDSAvatar
        name="Taylor Nguyen"
        size="large"
        status={<XDSAvatarStatusDot variant="positive" label="Online" />}
      />
    </XDSStack>
  );
}
