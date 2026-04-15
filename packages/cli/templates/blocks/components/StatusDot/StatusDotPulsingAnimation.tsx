'use client';

import {XDSStatusDot} from '@xds/core/StatusDot';

export default function StatusDotPulsingAnimation() {
  return (
    <XDSStatusDot variant="positive" label="Live" isPulsing />
  );
}

export const showcase = {
  aspectRatio: 1,
  render: StatusDotPulsingAnimation,
};
