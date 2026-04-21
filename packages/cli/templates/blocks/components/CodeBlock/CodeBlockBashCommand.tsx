'use client';

import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSVStack} from '@xds/core/Stack';

export default function CodeBlockBashCommand() {
  return (
    <XDSVStack gap={4}>
      <XDSCodeBlock
        code="npm install @xds/core @stylexjs/stylex"
        language="bash"
        hasCopyButton
      />
      <XDSCodeBlock
        code={`curl -s https://api.example.com/status | jq '.services[] | select(.healthy == false)'`}
        language="bash"
        hasCopyButton
      />
    </XDSVStack>
  );
}
