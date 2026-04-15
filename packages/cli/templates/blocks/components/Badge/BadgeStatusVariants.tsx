'use client';

import {XDSBadge} from '@xds/core/Badge';

export default function BadgeStatusVariants() {
  return (
    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
      <XDSBadge variant="success" label="Active" />
      <XDSBadge variant="error" label="Failed" />
      <XDSBadge variant="warning" label="Pending" />
    </div>
  );
}
