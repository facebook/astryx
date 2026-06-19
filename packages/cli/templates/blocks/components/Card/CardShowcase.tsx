// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Card} from '@xds/core/Card';
import {Stack} from '@xds/core/Layout';
import {Text, Heading} from '@xds/core/Text';

export default function CardShowcase() {
  return (
    <Card width={320}>
      <Stack direction="vertical" gap={2}>
        <Heading level={4}>Card title</Heading>
        <Text type="body" color="secondary">
          Cards group related content with a border and background. Use them for
          profiles, settings panels, or data summaries.
        </Text>
      </Stack>
    </Card>
  );
}
