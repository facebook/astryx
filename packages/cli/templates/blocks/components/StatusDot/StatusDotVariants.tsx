'use client';

import {XDSStatusDot} from '@xds/core/StatusDot';

export default function StatusDotVariants() {
  return (
    <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
      <XDSStatusDot variant="positive" label="Positive" />
      <XDSStatusDot variant="warning" label="Warning" />
      <XDSStatusDot variant="negative" label="Negative" />
      <XDSStatusDot variant="info" label="Info" />
      <XDSStatusDot variant="neutral" label="Neutral" />
    </div>
  );
}
