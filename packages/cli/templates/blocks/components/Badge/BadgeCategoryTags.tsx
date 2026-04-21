'use client';

import {XDSBadge} from '@xds/core/Badge';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const CATEGORIES = [
  {variant: 'blue' as const, label: 'Design'},
  {variant: 'cyan' as const, label: 'DevOps'},
  {variant: 'green' as const, label: 'Backend'},
  {variant: 'orange' as const, label: 'Urgent'},
  {variant: 'pink' as const, label: 'Marketing'},
  {variant: 'purple' as const, label: 'Engineering'},
  {variant: 'red' as const, label: 'Critical'},
  {variant: 'teal' as const, label: 'Research'},
  {variant: 'yellow' as const, label: 'Review'},
];

export default function BadgeCategoryTags() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Use color variants to tag categories or teams
      </XDSText>
      <XDSStack direction="horizontal" gap={2} style={{flexWrap: 'wrap'}}>
        {CATEGORIES.map(({variant, label}) => (
          <XDSBadge key={label} variant={variant} label={label} />
        ))}
      </XDSStack>
    </XDSStack>
  );
}
