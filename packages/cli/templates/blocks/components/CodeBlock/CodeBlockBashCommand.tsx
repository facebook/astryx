'use client';

import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSVStack} from '@xds/core/Stack';

export default function CodeBlockBashCommand() {
  return (
    <XDSVStack gap={4} style={{width: '100%', maxWidth: 400}}>
      <XDSCodeBlock
        code="npm install @xds/core"
        language="bash"
        hasCopyButton
        style={{width: '100%'}}
      />
      <XDSCodeBlock
        code="yarn add @stylexjs/stylex"
        language="bash"
        hasCopyButton
        style={{width: '100%'}}
      />
    </XDSVStack>
  );
}
