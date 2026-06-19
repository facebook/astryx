// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Card} from '@xds/core/Card';
import {Stack} from '@xds/core/Layout';
import {Heading, Text} from '@xds/core/Text';

export default function CardCallout() {
  return (
    <Stack direction="horizontal" gap={4}>
      <Card width={270} variant="muted">
        <Stack direction="vertical" gap={2}>
          <Heading level={3}>Tip</Heading>
          <Text type="body" color="secondary">
            Use the muted variant for callouts or supplementary information.
          </Text>
        </Stack>
      </Card>
      <Card width={270} variant="muted">
        <Stack direction="vertical" gap={2}>
          <Heading level={3}>Note</Heading>
          <Text type="body" color="secondary">
            Muted cards work well in sidebars or help panels.
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
}
