'use client';

import {XDSCodeBlock} from '@xds/core/CodeBlock';

export default function CodeBlockTypeScriptWithLineNumbers() {
  return (
    <XDSCodeBlock
      code={`function greet(name: string) { return name; }`}
      language="typescript"
      hasLineNumbers
      title="greet.ts"
    />
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: CodeBlockTypeScriptWithLineNumbers,
};
