'use client';

import {XDSStatusDot} from '@xds/core/StatusDot';

export default function StatusDotWithPulse() {
  return (
    <XDSStatusDot variant="positive" label="Active" isPulsing />
  );
}
