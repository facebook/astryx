'use client';

import {XDSBadge} from '@xds/core/Badge';

export default function BadgeCountBadges() {
  return (
    <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
      <XDSBadge variant="info" label={3} />
      <XDSBadge variant="error" label="99+" />
      <XDSBadge variant="success" label={12} />
    </div>
  );
}
