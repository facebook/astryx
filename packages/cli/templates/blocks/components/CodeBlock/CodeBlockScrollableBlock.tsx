// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSCodeBlock} from '@xds/core/CodeBlock';

const code = Array.from(
  {length: 50},
  (_, i) => `const line${i + 1} = ${i + 1};`,
).join('\n');

export default function CodeBlockScrollableBlock() {
  return (
    <XDSCodeBlock
      code={code}
      language="typescript"
      title="many-lines.ts"
      hasLineNumbers
      maxHeight={280}
    />
  );
}
