'use client';

import {XDSCodeBlock} from '@xds/core/CodeBlock';

export default function CodeBlockBashCommand() {
  return (
    <XDSCodeBlock
      code="npm install @xds/core"
      language="bash"
      hasCopyButton
    />
  );
}
