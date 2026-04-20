'use client';

import {XDSButton} from '@xds/core/Button';

export default function ButtonSizeVariants() {
  return (
    <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
      <XDSButton label="Small" variant="primary" size="sm" />
      <XDSButton label="Medium" variant="primary" size="md" />
      <XDSButton label="Large" variant="primary" size="lg" />
    </div>
  );
}
