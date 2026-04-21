'use client';

import {XDSStatusDot} from '@xds/core/StatusDot';

export default function StatusDotPulsing() {
  return (
    <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
      <XDSStatusDot variant="positive" label="Live" isPulsing />
      <XDSStatusDot variant="warning" label="Processing" isPulsing />
      <XDSStatusDot variant="negative" label="Error" isPulsing />
    </div>
  );
}
