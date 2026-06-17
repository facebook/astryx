// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Avatar} from '@xds/core/Avatar';
import {HStack, VStack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

export default function AvatarFallbackChain() {
  return (
    <VStack gap={4}>
      <HStack gap={3} vAlign="center">
        <Avatar
          src="https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-60.jpg"
          name="Carol Davis"
          size="medium"
        />
        <Text type="supporting">Valid src</Text>
      </HStack>
      <HStack gap={3} vAlign="center">
        <Avatar
          src="https://lookaside.facebook.com/assets/xds_oss/does-not-exist-primary.jpg"
          fallbackSrc="https://lookaside.facebook.com/assets/xds_oss/illustration-horizontal-2.png"
          name="Invalid User"
          size="medium"
        />
        <Text type="supporting">Invalid src, valid fallbackSrc</Text>
      </HStack>
      <HStack gap={3} vAlign="center">
        <Avatar
          src="https://lookaside.facebook.com/assets/xds_oss/does-not-exist-primary.jpg"
          fallbackSrc="https://lookaside.facebook.com/assets/xds_oss/does-not-exist-fallback.jpg"
          name="Test User"
          size="medium"
        />
        <Text type="supporting">Both invalid, has name</Text>
      </HStack>
      <HStack gap={3} vAlign="center">
        <Avatar
          src="https://lookaside.facebook.com/assets/xds_oss/does-not-exist-primary.jpg"
          size="medium"
        />
        <Text type="supporting">All invalid, no name</Text>
      </HStack>
    </VStack>
  );
}
