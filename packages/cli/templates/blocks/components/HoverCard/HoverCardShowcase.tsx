// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {HoverCard} from '@astryxdesign/core/HoverCard';
import {Button} from '@astryxdesign/core/Button';
import {Stack} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';

export default function HoverCardShowcase() {
  return (
    <HoverCard
      placement="above"
      content={
        <Stack direction="vertical" gap={2} style={{width: 240}}>
          <Stack direction="horizontal" gap={2} vAlign="center">
            <Avatar name="Jane Doe" size="lg" />
            <Stack direction="vertical" gap={0}>
              <Heading level={5}>Jane Doe</Heading>
              <Text type="supporting" color="secondary">
                Software Engineer
              </Text>
            </Stack>
          </Stack>
          <Text type="body" color="secondary">
            Building great products with great people.
          </Text>
        </Stack>
      }>
      <Button label="@janedoe" variant="ghost" />
    </HoverCard>
  );
}
