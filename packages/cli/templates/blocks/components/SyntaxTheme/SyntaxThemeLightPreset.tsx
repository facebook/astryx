// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {SyntaxTheme} from '@astryxdesign/core/theme';
import {githubLight} from '@astryxdesign/core/theme/syntax';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';

const code = `const status = response.ok ? 'success' : 'error';
console.log({status});`;

export default function SyntaxThemeLightPreset() {
  return (
    <SyntaxTheme theme={githubLight}>
      <CodeBlock code={code} language="tsx" title="GitHub Light preset" />
    </SyntaxTheme>
  );
}
