// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Stack';

const TYPES = [
  {type: 'body' as const, label: 'Body text', sample: 'Body text for paragraphs and general content'},
  {type: 'large' as const, label: 'Large text', sample: 'Large text for introductions and callouts'},
  {type: 'label' as const, label: 'Label text', sample: 'Label text for form fields and section titles'},
  {type: 'supporting' as const, label: 'Supporting text', sample: 'Supporting text for captions and metadata'},
  {type: 'code' as const, label: 'Code text', sample: 'const theme = defineTheme({})'},
  {type: 'body' as const, label: 'Strikethrough', sample: 'Body text with strikethrough decoration', hasStrikethrough: true},
  {type: 'body' as const, label: 'Tabular numbers', sample: '1,234.56  78.90  100,000.00', hasTabularNumbers: true},
];

export default function TextTypes() {
  return (
    <XDSStack direction="vertical" gap={3}>
      {TYPES.map(({type, label, sample, hasStrikethrough, hasTabularNumbers}) => (
        <XDSStack key={label} direction="vertical" gap={0}>
          <XDSText type="supporting" color="secondary">
            {label}
          </XDSText>
          <XDSText
            type={type}
            display="block"
            hasStrikethrough={hasStrikethrough}
            hasTabularNumbers={hasTabularNumbers}>
            {sample}
          </XDSText>
        </XDSStack>
      ))}
    </XDSStack>
  );
}
