'use client';

import {XDSBadge} from '@xds/core/Badge';

export default function BadgeColorVariants() {
  return (
    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
      <XDSBadge variant="blue" label="Design" />
      <XDSBadge variant="purple" label="Engineering" />
      <XDSBadge variant="teal" label="Research" />
      <XDSBadge variant="orange" label="Urgent" />
    </div>
  );
}
