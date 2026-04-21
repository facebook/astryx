'use client';

import {XDSButton} from '@xds/core/Button';
import {XDSBadge} from '@xds/core/Badge';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ButtonWithEndSlot() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Trailing badges for counts or status
      </XDSText>
      <XDSStack direction="horizontal" gap={3} vAlign="center">
        <XDSButton
          label="Messages"
          variant="primary"
          endContent={<XDSBadge variant="info" label={3} />}
        />
        <XDSButton
          label="Notifications"
          variant="secondary"
          endContent={<XDSBadge variant="warning" label={12} />}
        />
        <XDSButton
          label="Updates"
          variant="ghost"
          endContent={<XDSBadge variant="neutral" label="New" />}
        />
      </XDSStack>
    </XDSStack>
  );
}
