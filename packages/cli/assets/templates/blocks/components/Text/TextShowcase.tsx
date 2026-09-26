// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Text} from '@astryxdesign/core/Text';
import {Stack} from '@astryxdesign/core/Stack';

export default function TextShowcase() {
  return (
    <Stack direction="vertical" gap={2}>
      <Text type="body">Body: The bulk of content</Text>
      <Text type="large">Large: Emphasized content</Text>
      <Text type="label">Label: Form and chart labels</Text>
      <Text type="supporting">Supporting: Helper text</Text>
      <Text type="code">Code: const x = 42;</Text>
    </Stack>
  );
}
