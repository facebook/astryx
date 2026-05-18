// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const VARIANTS = [
  {variant: 'default' as const, label: 'General', note: '4 tasks due today'},
  {
    variant: 'muted' as const,
    label: 'Archived',
    note: 'No activity in 30 days',
  },
  {variant: 'blue' as const, label: 'Engineering', note: '12 open issues'},
  {variant: 'green' as const, label: 'Marketing', note: '3 campaigns active'},
  {variant: 'orange' as const, label: 'Urgent', note: '2 items need review'},
  {variant: 'purple' as const, label: 'Design', note: '5 drafts in progress'},
];

export default function CardVariants() {
  return (
    <XDSStack direction="horizontal" gap={3} style={{flexWrap: 'wrap'}}>
      {VARIANTS.map(({variant, label, note}) => (
        <XDSCard key={variant} variant={variant} width={160}>
          <XDSStack direction="vertical" gap={1}>
            <XDSText type="body" weight="bold">
              {label}
            </XDSText>
            <XDSText type="supporting" color="secondary">
              {note}
            </XDSText>
          </XDSStack>
        </XDSCard>
      ))}
    </XDSStack>
  );
}
