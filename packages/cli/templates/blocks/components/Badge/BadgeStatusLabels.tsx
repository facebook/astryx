'use client';

import {XDSBadge} from '@xds/core/Badge';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const STATUSES = [
  {variant: 'success' as const, label: 'Active'},
  {variant: 'warning' as const, label: 'Pending'},
  {variant: 'error' as const, label: 'Failed'},
  {variant: 'neutral' as const, label: 'Draft'},
  {variant: 'info' as const, label: 'In Review'},
];

export default function BadgeStatusLabels() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Use semantic variants to show system status
      </XDSText>
      <XDSStack direction="horizontal" gap={2} vAlign="center">
        {STATUSES.map(({variant, label}) => (
          <XDSBadge key={label} variant={variant} label={label} />
        ))}
      </XDSStack>
    </XDSStack>
  );
}
