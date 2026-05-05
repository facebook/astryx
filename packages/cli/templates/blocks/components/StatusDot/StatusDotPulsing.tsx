'use client';

import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSHStack} from '@xds/core/Layout';

export default function StatusDotPulsing() {
  return (
    <XDSHStack gap={2} vAlign="center">
      <XDSStatusDot variant="positive" label="Live" isPulsing />
      <XDSStatusDot variant="warning" label="Processing" isPulsing />
      <XDSStatusDot variant="negative" label="Error" isPulsing />
      <XDSStatusDot variant="info" label="Processing" isPulsing />
      <XDSStatusDot variant="neutral" label="Error" isPulsing />
    </XDSHStack>
  );
}
