'use client';

import {XDSBadge} from '@xds/core/Badge';

export default function BadgeStatusLabels() {
  return (
    <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
      <XDSBadge variant="success" label="Active" />
      <XDSBadge variant="warning" label="Pending" />
      <XDSBadge variant="error" label="Failed" />
      <XDSBadge variant="neutral" label="Draft" />
    </div>
  );
}
