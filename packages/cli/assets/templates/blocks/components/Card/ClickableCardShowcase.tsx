// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {Stack} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';

export default function ClickableCardShowcase() {
  return (
    <ClickableCard label="Settings" href="#" width={320}>
      <Stack direction="vertical" gap={2}>
        <Heading level={4}>Settings</Heading>
        <Text type="body" color="secondary">
          Click anywhere on this card to navigate. Nested buttons and links work
          independently.
        </Text>
      </Stack>
    </ClickableCard>
  );
}
