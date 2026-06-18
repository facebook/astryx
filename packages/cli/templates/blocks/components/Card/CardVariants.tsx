// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Card} from '@xds/core/Card';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

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
    <Stack direction="horizontal" gap={3} style={{flexWrap: 'wrap'}}>
      {VARIANTS.map(({variant, label, note}) => (
        <Card key={variant} variant={variant} width={160}>
          <Stack direction="vertical" gap={1}>
            <Text type="body" weight="bold">
              {label}
            </Text>
            <Text type="supporting" color="secondary">
              {note}
            </Text>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}
