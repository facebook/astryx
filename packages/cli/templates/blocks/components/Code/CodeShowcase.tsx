// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Code} from '@xds/core/CodeBlock';
import {Text} from '@xds/core/Text';
import {Stack} from '@xds/core/Layout';

export default function CodeShowcase() {
  return (
    <Stack direction="vertical" gap={3}>
      <Text type="body">
        Run <Code>npm install @xds/core</Code> to add the package.
      </Text>
      <Text type="body">
        Use the <Code>variant</Code> prop to switch between{' '}
        <Code>primary</Code>, <Code>secondary</Code>, and{' '}
        <Code>ghost</Code> styles.
      </Text>
    </Stack>
  );
}
