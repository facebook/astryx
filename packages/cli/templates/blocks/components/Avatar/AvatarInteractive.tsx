// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Avatar} from '@astryxdesign/core/Avatar';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

export default function AvatarInteractive() {
  return (
    <Stack direction="horizontal" gap={6} vAlign="start">
      <Stack direction="vertical" gap={2} hAlign="center">
        <Avatar
          src="https://lookaside.facebook.com/assets/astryx/DATA-Itai-Jordaan.png"
          name="Itai Jordaan"
          size="xl"
          href="https://example.com/people/itai-jordaan"
        />
        <Text type="supporting" color="secondary">
          Link (href)
        </Text>
      </Stack>
      <Stack direction="vertical" gap={2} hAlign="center">
        <Avatar
          src="https://lookaside.facebook.com/assets/astryx/DATA-Margot-Schroder.png"
          name="Margot Schroder"
          size="xl"
          onClick={() => window.alert('Opening Margot Schroder’s profile')}
        />
        <Text type="supporting" color="secondary">
          Button (onClick)
        </Text>
      </Stack>
    </Stack>
  );
}
