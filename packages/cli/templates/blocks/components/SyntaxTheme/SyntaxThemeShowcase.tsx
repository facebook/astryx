// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSSyntaxTheme} from '@xds/core/theme';
import {oneDarkPro, githubLight, dracula} from '@xds/core/theme/syntax';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const sampleCode = `import {XDSButton} from '@xds/core/Button';

export function App() {
  return (
    <XDSButton
      label="Hello XDS"
      variant="primary"
      onClick={() => console.log('clicked')}
    />
  );
}`;

function ThemePreview({
  theme,
  label,
}: {
  theme: Parameters<typeof XDSSyntaxTheme>[0]['theme'];
  label: string;
}) {
  return (
    <XDSSyntaxTheme theme={theme}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" weight="bold" color="secondary">
          {label}
        </XDSText>
        <XDSCodeBlock code={sampleCode} language="tsx" />
      </XDSStack>
    </XDSSyntaxTheme>
  );
}

export default function SyntaxThemeShowcase() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <ThemePreview theme={githubLight} label="GitHub Light" />
      <ThemePreview theme={oneDarkPro} label="One Dark Pro" />
      <ThemePreview theme={dracula} label="Dracula" />
    </XDSStack>
  );
}
