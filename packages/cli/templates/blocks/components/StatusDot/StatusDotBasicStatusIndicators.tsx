'use client';

import {XDSStatusDot} from '@xds/core/StatusDot';

export default function StatusDotBasicStatusIndicators() {
  return (
    <>
      <XDSStatusDot variant="positive" label="Online" />
      <XDSStatusDot variant="negative" label="Offline" />
      <XDSStatusDot variant="warning" label="Away" />
    </>
  );
}
