'use client';

import {XDSBadge} from '@xds/core/Badge';

export default function BadgeCategoryTags() {
  return (
    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
      <XDSBadge variant="blue" label="Design" />
      <XDSBadge variant="cyan" label="DevOps" />
      <XDSBadge variant="green" label="Backend" />
      <XDSBadge variant="orange" label="Urgent" />
      <XDSBadge variant="pink" label="Marketing" />
      <XDSBadge variant="purple" label="Engineering" />
      <XDSBadge variant="red" label="Critical" />
      <XDSBadge variant="teal" label="Research" />
      <XDSBadge variant="yellow" label="Review" />
    </div>
  );
}
