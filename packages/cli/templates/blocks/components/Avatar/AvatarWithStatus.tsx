// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Avatar, AvatarStatusDot} from '@xds/core/Avatar';
import {Stack} from '@xds/core/Layout';

export default function AvatarWithStatus() {
  return (
    <Stack direction="horizontal" gap={4} vAlign="center">
      <Avatar
        src="https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-05.jpg"
        name="Alex Daniels"
        size="large"
        status={<AvatarStatusDot variant="success" label="Online" />}
      />
      <Avatar
        src="https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-30.jpg"
        name="Ann Smith"
        size="large"
        status={<AvatarStatusDot variant="neutral" label="Offline" />}
      />
      <Avatar
        src="https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-60.jpg"
        name="Carol Davis"
        size="large"
        status={<AvatarStatusDot variant="error" label="Busy" />}
      />
    </Stack>
  );
}
