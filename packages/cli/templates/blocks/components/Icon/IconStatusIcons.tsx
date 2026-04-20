'use client';

import {XDSIcon} from '@xds/core/Icon';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const statuses = [
  {icon: 'success' as const, color: 'positive' as const, label: 'Deployed successfully'},
  {icon: 'warning' as const, color: 'warning' as const, label: 'Build has warnings'},
  {icon: 'error' as const, color: 'negative' as const, label: 'Pipeline failed'},
  {icon: 'info' as const, color: 'accent' as const, label: 'New version available'},
] as const;

export default function IconStatusIcons() {
  return (
    <XDSVStack gap={3}>
      {statuses.map((status) => (
        <XDSHStack key={status.label} gap={2} vAlign="center">
          <XDSIcon icon={status.icon} color={status.color} size="sm" />
          <XDSText type="body">{status.label}</XDSText>
        </XDSHStack>
      ))}
    </XDSVStack>
  );
}
