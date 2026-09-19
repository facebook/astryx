// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Badge} from '@astryxdesign/core/Badge';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

const COUNTS = [
  {variant: 'info' as const, label: '3', note: 'Messages'},
  {variant: 'error' as const, label: '99+', note: 'Alerts'},
  {variant: 'success' as const, label: '12', note: 'Completed'},
  {variant: 'warning' as const, label: '5', note: 'Pending'},
];

export default function BadgeCountBadges() {
  return (
    <Stack direction="horizontal" gap={8} hAlign="center" vAlign="center">
      {COUNTS.map(({variant, label, note}) => (
        <Stack key={note} direction="vertical" gap={2} hAlign="center">
          <Badge variant={variant} label={label} />
          <Text type="supporting" color="secondary">
            {note}
          </Text>
        </Stack>
      ))}
    </Stack>
  );
}
