// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSSyntaxTheme} from '@xds/core/theme';
import {githubLight} from '@xds/core/theme/syntax';
import {XDSCodeBlock} from '@xds/core/CodeBlock';

const code = `const status = response.ok ? 'success' : 'error';
console.log({status});`;

export default function SyntaxThemeLightPreset() {
  return (
    <XDSSyntaxTheme theme={githubLight}>
      <XDSCodeBlock code={code} language="tsx" title="GitHub Light preset" />
    </XDSSyntaxTheme>
  );
}
