'use client';

import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const VARIANTS = [
  {variant: 'default' as const, label: 'Default'},
  {variant: 'muted' as const, label: 'Muted'},
  {variant: 'blue' as const, label: 'Blue'},
  {variant: 'green' as const, label: 'Green'},
  {variant: 'orange' as const, label: 'Orange'},
  {variant: 'purple' as const, label: 'Purple'},
];

export default function CardVariants() {
  return (
    <XDSStack direction="horizontal" gap={3} style={{flexWrap: 'wrap'}}>
      {VARIANTS.map(({variant, label}) => (
        <XDSCard key={variant} variant={variant} width={160}>
          <XDSStack direction="vertical" gap={1}>
            <XDSText type="body" weight="bold">
              {label}
            </XDSText>
            <XDSText type="supporting" color="secondary">
              {variant}
            </XDSText>
          </XDSStack>
        </XDSCard>
      ))}
    </XDSStack>
  );
}
