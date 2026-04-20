'use client';

import {XDSButton} from '@xds/core/Button';

export default function ButtonLoading() {
  return (
    <div style={{display: 'flex', gap: 12}}>
      <XDSButton label="Loading..." variant="primary" isLoading />
      <XDSButton label="Loading..." variant="secondary" isLoading />
      <XDSButton label="Loading..." variant="ghost" isLoading />
      <XDSButton label="Loading..." variant="destructive" isLoading />
    </div>
  );
}
