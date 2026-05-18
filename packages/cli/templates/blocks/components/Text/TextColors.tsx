// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Stack';

const COLORS = [
  {color: 'primary' as const, description: 'Primary — Default for headings and body text'},
  {color: 'secondary' as const, description: 'Secondary — Supporting details and metadata'},
  {color: 'active' as const, description: 'Active — Links, success states, and emphasis'},
  {color: 'disabled' as const, description: 'Disabled — Unavailable or inactive content'},
  {color: 'placeholder' as const, description: 'Placeholder — Empty field hints'},
];

export default function TextColors() {
  return (
    <XDSStack direction="vertical" gap={3}>
      {COLORS.map(({color, description}) => (
        <XDSText key={color} type="body" color={color}>
          {description}
        </XDSText>
      ))}
    </XDSStack>
  );
}
