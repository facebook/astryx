// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {SyntaxTheme} from '@xds/core/theme';
import {oneDarkPro} from '@xds/core/theme/syntax';
import {CodeBlock} from '@xds/core/CodeBlock';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

const sampleCode = `async function save() {
  await api.update(values);
  toast.show('Saved');
}`;

export default function SyntaxThemeShowcase() {
  return (
    <SyntaxTheme theme={oneDarkPro}>
      <Stack
        direction="vertical"
        gap={2}
        style={{width: 360, maxWidth: '100%'}}>
        <Text type="supporting" weight="bold" color="secondary">
          One Dark Pro preset
        </Text>
        <CodeBlock code={sampleCode} language="tsx" />
      </Stack>
    </SyntaxTheme>
  );
}
