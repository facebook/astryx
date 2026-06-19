// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSSyntaxTheme} from '@xds/core/theme';
import {dracula} from '@xds/core/theme/syntax';
import {XDSCodeBlock} from '@xds/core/CodeBlock';

const code = `function greet(name: string) {
  return \`Hello, \${name}!\`;
}`;

export default function SyntaxThemeDarkPreset() {
  return (
    <XDSSyntaxTheme theme={dracula}>
      <XDSCodeBlock code={code} language="tsx" title="Dracula preset" />
    </XDSSyntaxTheme>
  );
}
