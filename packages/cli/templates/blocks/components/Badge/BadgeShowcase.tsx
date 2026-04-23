'use client';

import {XDSBadge} from '@xds/core/Badge';
import {XDSStack} from '@xds/core/Layout';

export default function BadgeShowcase() {
  return (
    <XDSStack direction="vertical" gap={4} hAlign="center">
      <XDSStack direction="horizontal" gap={2}>
        <XDSBadge label="Neutral" variant="neutral" />
        <XDSBadge label="Info" variant="info" />
        <XDSBadge label="Success" variant="success" />
        <XDSBadge label="Warning" variant="warning" />
        <XDSBadge label="Error" variant="error" />
      </XDSStack>
      <XDSStack direction="horizontal" gap={2}>
        <XDSBadge label="Blue" variant="blue" />
        <XDSBadge label="Purple" variant="purple" />
        <XDSBadge label="Pink" variant="pink" />
        <XDSBadge label="Teal" variant="teal" />
        <XDSBadge label="Orange" variant="orange" />
      </XDSStack>
    </XDSStack>
  );
}
