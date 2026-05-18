// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSAvatar, XDSAvatarStatusDot} from '@xds/core/Avatar';
import {XDSStack} from '@xds/core/Layout';

export default function AvatarShowcase() {
  return (
    <XDSStack direction="horizontal" gap={4} vAlign="center">
      <XDSAvatar
        name="Ann Smith"
        size="large"
        src="https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-30.jpg"
        status={<XDSAvatarStatusDot variant="positive" label="Online" />}
      />
      <XDSAvatar
        name="Alex Daniels"
        size="large"
        src="https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-05.jpg"
      />
      <XDSAvatar name="Sam Chen" size="large" />
      <XDSAvatar
        name="Taylor Nguyen"
        size="large"
        status={<XDSAvatarStatusDot variant="negative" label="Online" />}
      />
    </XDSStack>
  );
}
