// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {CodeBlock} from '@xds/core/CodeBlock';
import {VStack} from '@xds/core/Stack';

export default function CodeBlockBashCommand() {
  return (
    <VStack gap={4} style={{width: '100%', maxWidth: 400}}>
      <CodeBlock
        code="npm install @xds/core"
        language="bash"
        hasCopyButton
        style={{width: '100%'}}
      />
      <CodeBlock
        code="yarn add @stylexjs/stylex"
        language="bash"
        hasCopyButton
        style={{width: '100%'}}
      />
    </VStack>
  );
}
