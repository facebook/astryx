// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSSyntaxTheme} from '@xds/core/theme';
import {oneDarkPro} from '@xds/core/theme/syntax';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const sampleCode = `async function save() {
  await api.update(values);
  toast.show('Saved');
}`;

export default function SyntaxThemeShowcase() {
  return (
    <XDSSyntaxTheme theme={oneDarkPro}>
      <XDSStack
        direction="vertical"
        gap={2}
        style={{width: 360, maxWidth: '100%'}}>
        <XDSText type="supporting" weight="bold" color="secondary">
          One Dark Pro preset
        </XDSText>
        <XDSCodeBlock code={sampleCode} language="tsx" />
      </XDSStack>
    </XDSSyntaxTheme>
  );
}
