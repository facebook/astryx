// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Code} from '@astryxdesign/core/CodeBlock';
import {Text} from '@astryxdesign/core/Text';
import {Stack} from '@astryxdesign/core/Layout';

export default function CodeShowcase() {
  return (
    <Stack direction="vertical" gap={3}>
      <Text type="body">
        Run <Code>npm install @astryxdesign/core</Code> to add the package.
      </Text>
      <Text type="body">
        Use the <Code>variant</Code> prop to switch between{' '}
        <Code>primary</Code>, <Code>secondary</Code>, and{' '}
        <Code>ghost</Code> styles.
      </Text>
    </Stack>
  );
}
