// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Token} from '@astryxdesign/core/Token';
import {Badge} from '@astryxdesign/core/Badge';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

export default function TokenEndContent() {
  return (
    <Stack direction="vertical" gap={4}>
      <Text type="supporting" color="secondary">
        Trailing badges for counts or status
      </Text>
      <Stack direction="horizontal" gap={2} wrap="wrap">
        <Token
          label="Inbox"
          color="blue"
          endContent={<Badge variant="info" label={12} />}
        />
        <Token
          label="Reviews"
          color="purple"
          endContent={<Badge variant="purple" label={3} />}
        />
        <Token
          label="Resolved"
          color="green"
          endContent={<Badge variant="success" label="Done" />}
        />
      </Stack>
    </Stack>
  );
}
