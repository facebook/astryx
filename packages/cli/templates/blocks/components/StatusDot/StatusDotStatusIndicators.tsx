'use client';

import {XDSStatusDot} from '@xds/core/StatusDot';

const statuses = [
  {variant: 'positive', label: 'Online'},
  {variant: 'warning', label: 'Away'},
  {variant: 'negative', label: 'Offline'},
  {variant: 'neutral', label: 'Unknown'},
] as const;

export default function StatusDotStatusIndicators() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      {statuses.map(({variant, label}) => (
        <div
          key={variant}
          style={{display: 'flex', gap: 8, alignItems: 'center'}}>
          <XDSStatusDot variant={variant} label={label} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
