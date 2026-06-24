// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Token} from '@astryxdesign/core/Token';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

export default function TokenRemovable() {
  return (
    <Stack direction="vertical" gap={10}>
      <Stack direction="vertical" gap={2}>
        <Text type="supporting" color="secondary">
          Active filters
        </Text>
        <Stack direction="horizontal" gap={2} wrap="wrap">
          <Token label="Status: Open" color="green" onRemove={() => {}} />
          <Token label="Priority: High" color="red" onRemove={() => {}} />
          <Token label="Team: Design" color="purple" onRemove={() => {}} />
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={2}>
        <Text type="supporting" color="secondary">
          Selected recipients
        </Text>
        <Stack direction="horizontal" gap={2} wrap="wrap">
          <Token label="Sarah Chen" color="blue" onRemove={() => {}} />
          <Token label="Alex Rivera" color="blue" onRemove={() => {}} />
          <Token label="Jordan Lee" color="blue" onRemove={() => {}} />
        </Stack>
      </Stack>
    </Stack>
  );
}
