'use client';

import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Stack';

const COLORS = [
  {color: 'primary' as const, description: 'Primary — default for headings and body text'},
  {color: 'secondary' as const, description: 'Secondary — supporting details and metadata'},
  {color: 'active' as const, description: 'Active — links, success states, and emphasis'},
  {color: 'disabled' as const, description: 'Disabled — unavailable or inactive content'},
  {color: 'placeholder' as const, description: 'Placeholder — empty field hints'},
];

export default function TextColors() {
  return (
    <XDSStack direction="vertical" gap={3}>
      {COLORS.map(({color, description}) => (
        <XDSStack key={color} direction="horizontal" gap={3} vAlign="center">
          <XDSText type="supporting" color="secondary">
            {color}
          </XDSText>
          <XDSText type="body" color={color}>
            {description}
          </XDSText>
        </XDSStack>
      ))}
    </XDSStack>
  );
}
