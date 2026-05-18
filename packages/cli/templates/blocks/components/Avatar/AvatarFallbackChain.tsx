// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSAvatar} from '@xds/core/Avatar';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function AvatarFallbackChain() {
  return (
    <XDSVStack gap={4}>
      <XDSHStack gap={3} vAlign="center">
        <XDSAvatar
          src="https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-60.jpg"
          name="Carol Davis"
          size="medium"
        />
        <XDSText type="supporting">Valid src</XDSText>
      </XDSHStack>
      <XDSHStack gap={3} vAlign="center">
        <XDSAvatar
          src="https://lookaside.facebook.com/assets/xds_oss/does-not-exist-primary.jpg"
          fallbackSrc="https://lookaside.facebook.com/assets/xds_oss/illustration-horizontal-2.png"
          name="Invalid User"
          size="medium"
        />
        <XDSText type="supporting">Invalid src, valid fallbackSrc</XDSText>
      </XDSHStack>
      <XDSHStack gap={3} vAlign="center">
        <XDSAvatar
          src="https://lookaside.facebook.com/assets/xds_oss/does-not-exist-primary.jpg"
          fallbackSrc="https://lookaside.facebook.com/assets/xds_oss/does-not-exist-fallback.jpg"
          name="Test User"
          size="medium"
        />
        <XDSText type="supporting">Both invalid, has name</XDSText>
      </XDSHStack>
      <XDSHStack gap={3} vAlign="center">
        <XDSAvatar
          src="https://lookaside.facebook.com/assets/xds_oss/does-not-exist-primary.jpg"
          size="medium"
        />
        <XDSText type="supporting">All invalid, no name</XDSText>
      </XDSHStack>
    </XDSVStack>
  );
}
