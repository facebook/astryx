// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Text} from '@astryxdesign/core/Text';
import {Stack} from '@astryxdesign/core/Stack';

const COLORS = [
  {
    color: 'primary' as const,
    description: 'Primary — Default for headings and body text',
  },
  {
    color: 'secondary' as const,
    description: 'Secondary — Supporting details and metadata',
  },
  {
    color: 'accent' as const,
    description: 'Accent — Links, emphasis, and accent-colored text',
  },
  {
    color: 'disabled' as const,
    description: 'Disabled — Unavailable or inactive content',
  },
  {
    color: 'placeholder' as const,
    description: 'Placeholder — Empty field hints',
  },
];

export default function TextColors() {
  return (
    <Stack direction="vertical" gap={3}>
      {COLORS.map(({color, description}) => (
        <Text key={color} type="body" color={color}>
          {description}
        </Text>
      ))}
    </Stack>
  );
}
