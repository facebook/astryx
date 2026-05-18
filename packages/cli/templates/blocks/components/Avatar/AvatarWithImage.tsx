// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSAvatar} from '@xds/core/Avatar';
import {XDSStack} from '@xds/core/Layout';

export default function AvatarWithImage() {
  return (
    <XDSStack direction="horizontal" gap={4} vAlign="center">
      <XDSAvatar
        src="https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-05.jpg"
        name="Alex Daniles"
        size="tiny"
      />
      <XDSAvatar
        src="https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-30.jpg"
        name="Ann Smith"
        size="small"
      />
      <XDSAvatar
        src="https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-60.jpg"
        name="Carol Davis"
        size="medium"
      />
      <XDSAvatar
        src="https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-98.jpg"
        name="Gina Wilson"
        size="large"
      />
    </XDSStack>
  );
}
