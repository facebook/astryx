'use client';

import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSHStack} from '@xds/core/Layout';

export default function StatusDotShowcase() {
  return (
    <XDSHStack gap={2} vAlign="center">
      <XDSStatusDot variant="positive" label="Positive" />
      <XDSStatusDot variant="warning" label="Warning" />
      <XDSStatusDot variant="negative" label="Negative" />
      <XDSStatusDot variant="info" label="Info" />
      <XDSStatusDot variant="neutral" label="Neutral" />
    </XDSHStack>
  );
}
