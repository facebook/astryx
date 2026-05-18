// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSAvatar, XDSAvatarStatusDot} from '@xds/core/Avatar';
import {XDSStack} from '@xds/core/Layout';

export default function AvatarWithStatus() {
  return (
    <XDSStack direction="horizontal" gap={4} vAlign="center">
      <XDSAvatar
        src="https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-05.jpg"
        name="Alex Daniels"
        size="large"
        status={<XDSAvatarStatusDot variant="success" label="Online" />}
      />
      <XDSAvatar
        src="https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-30.jpg"
        name="Ann Smith"
        size="large"
        status={<XDSAvatarStatusDot variant="neutral" label="Offline" />}
      />
      <XDSAvatar
        src="https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-60.jpg"
        name="Carol Davis"
        size="large"
        status={<XDSAvatarStatusDot variant="error" label="Busy" />}
      />
    </XDSStack>
  );
}
