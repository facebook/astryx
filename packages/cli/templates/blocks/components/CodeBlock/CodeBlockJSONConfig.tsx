// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {CodeBlock} from '@astryxdesign/core/CodeBlock';

const code = `{
  "name": "@astryxdesign/core",
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
    <CodeBlock
      code={code}
      language="json"
      title="package.json"
      hasLineNumbers
    />
  );
}
