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
          src="https://lookaside.facebook.com/assets/astryx/DATA-Daniela-Gimenez.png"
          name="Daniela Gimenez"
          size="medium"
        />
        <Text type="supporting">Valid src</Text>
      </HStack>
      <HStack gap={3} vAlign="center">
        <Avatar
          src="https://lookaside.facebook.com/assets/astryx/does-not-exist-primary.jpg"
          fallbackSrc="https://lookaside.facebook.com/assets/astryx/DATA-Ami-Pena.png"
          name="Invalid User"
          size="medium"
        />
        <Text type="supporting">Invalid src, valid fallbackSrc</Text>
      </HStack>
      <HStack gap={3} vAlign="center">
        <Avatar
          src="https://lookaside.facebook.com/assets/astryx/does-not-exist-primary.jpg"
          fallbackSrc="https://lookaside.facebook.com/assets/astryx/does-not-exist-fallback.jpg"
          name="Test User"
          size="medium"
        />
        <Text type="supporting">Both invalid, has name</Text>
      </HStack>
      <HStack gap={3} vAlign="center">
        <Avatar
          src="https://lookaside.facebook.com/assets/astryx/does-not-exist-primary.jpg"
          size="medium"
        />
        <Text type="supporting">All invalid, no name</Text>
      </HStack>
    </VStack>
  );
}
