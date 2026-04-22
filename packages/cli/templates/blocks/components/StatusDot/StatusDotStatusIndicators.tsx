'use client';

import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const statuses = [
  {variant: 'positive', label: 'Online'},
  {variant: 'warning', label: 'Away'},
  {variant: 'negative', label: 'Offline'},
  {variant: 'neutral', label: 'Unknown'},
] as const;

export default function StatusDotStatusIndicators() {
  return (
    <XDSVStack gap={2}>
      {statuses.map(({variant, label}) => (
        <XDSHStack key={variant} gap={2} vAlign="center">
          <XDSStatusDot variant={variant} label={label} />
          <XDSText type="body">{label}</XDSText>
        </XDSHStack>
      ))}
    </XDSVStack>
  );
}
