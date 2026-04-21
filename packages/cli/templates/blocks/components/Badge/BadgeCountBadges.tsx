'use client';

import {XDSBadge} from '@xds/core/Badge';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const COUNTS = [
  {variant: 'info' as const, label: '3', note: 'Messages'},
  {variant: 'error' as const, label: '99+', note: 'Alerts'},
  {variant: 'success' as const, label: '12', note: 'Completed'},
  {variant: 'warning' as const, label: '5', note: 'Pending'},
];

export default function BadgeCountBadges() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Use badges as numeric counters
      </XDSText>
      <XDSStack direction="horizontal" gap={3} vAlign="center">
        {COUNTS.map(({variant, label, note}) => (
          <XDSStack key={note} direction="vertical" gap={1} hAlign="center">
            <XDSBadge variant={variant} label={label} />
            <XDSText type="supporting" color="secondary">
              {note}
            </XDSText>
          </XDSStack>
        ))}
      </XDSStack>
    </XDSStack>
  );
}
