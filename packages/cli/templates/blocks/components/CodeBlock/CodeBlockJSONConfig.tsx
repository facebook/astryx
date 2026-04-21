'use client';

import {XDSCodeBlock} from '@xds/core/CodeBlock';

const code = `{
  "name": "@xds/core",
  "version": "0.0.5",
  "dependencies": {
    "@stylexjs/stylex": "^0.17.5",
    "react": "^19.0.0"
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest"
  }
}`;

export default function CodeBlockJSONConfig() {
  return (
    <XDSCodeBlock
      code={code}
      language="json"
      title="package.json"
      hasLineNumbers
    />
  );
}
