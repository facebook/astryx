// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {HoverCard} from '@xds/core/HoverCard';
import {Button} from '@xds/core/Button';
import {Stack} from '@xds/core/Layout';
import {Text, Heading} from '@xds/core/Text';
import {Avatar} from '@xds/core/Avatar';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  card: {
    width: 240,
  },
});

export default function HoverCardShowcase() {
  return (
    <HoverCard
      placement="above"
      content={
        <Stack direction="vertical" gap={2} xstyle={styles.card}>
          <Stack direction="horizontal" gap={2} vAlign="center">
            <Avatar name="Jane Doe" size="medium" />
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
