// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Token} from '@astryxdesign/core/Token';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

const COLORS = [
  {color: 'default' as const, label: 'Default'},
  {color: 'red' as const, label: 'Red'},
  {color: 'orange' as const, label: 'Orange'},
  {color: 'yellow' as const, label: 'Yellow'},
  {color: 'green' as const, label: 'Green'},
  {color: 'teal' as const, label: 'Teal'},
  {color: 'cyan' as const, label: 'Cyan'},
  {color: 'blue' as const, label: 'Blue'},
  {color: 'purple' as const, label: 'Purple'},
  {color: 'pink' as const, label: 'Pink'},
  {color: 'gray' as const, label: 'Gray'},
];

export default function TokenColors() {
  return (
    <Stack
      direction="vertical"
      gap={10}
      width="100%"
      style={{maxWidth: 400}}>
      <Stack direction="vertical" gap={2}>
        <Text type="supporting" color="secondary">
          Default
        </Text>
        <Stack direction="horizontal" gap={1} wrap="wrap">
          {COLORS.map(({color, label}) => (
            <Token key={color} label={label} color={color} />
          ))}
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={2}>
        <Text type="supporting" color="secondary">
          Disabled
        </Text>
        <Stack direction="horizontal" gap={1} wrap="wrap">
          {COLORS.map(({color, label}) => (
            <Token key={color} label={label} color={color} isDisabled />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
