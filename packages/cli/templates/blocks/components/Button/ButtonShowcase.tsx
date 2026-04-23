'use client';

import {XDSButton} from '@xds/core/Button';
import {XDSStack} from '@xds/core/Layout';

export default function ButtonShowcase() {
  return (
    <XDSStack direction="horizontal" gap={3} vAlign="center">
      <XDSButton label="Primary" variant="primary" />
      <XDSButton label="Secondary" variant="secondary" />
      <XDSButton label="Ghost" variant="ghost" />
      <XDSButton label="Destructive" variant="destructive" />
    </XDSStack>
  );
}
