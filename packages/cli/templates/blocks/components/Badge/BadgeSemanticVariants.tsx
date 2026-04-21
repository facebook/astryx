'use client';

import {XDSBadge} from '@xds/core/Badge';

export default function BadgeSemanticVariants() {
  return (
    <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
      <XDSBadge variant="neutral" label="Neutral" />
      <XDSBadge variant="info" label="Info" />
      <XDSBadge variant="success" label="Success" />
      <XDSBadge variant="warning" label="Warning" />
      <XDSBadge variant="error" label="Error" />
    </div>
  );
}
