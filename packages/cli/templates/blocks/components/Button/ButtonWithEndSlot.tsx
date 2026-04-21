'use client';

import {XDSButton} from '@xds/core/Button';
import {XDSBadge} from '@xds/core/Badge';

export default function ButtonWithEndSlot() {
  return (
    <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
      <XDSButton
        label="Messages"
        variant="primary"
        endContent={<XDSBadge variant="info" label={3} />}
      />
      <XDSButton
        label="Notifications"
        variant="secondary"
        endContent={<XDSBadge variant="neutral" label="New" />}
      />
    </div>
  );
}
