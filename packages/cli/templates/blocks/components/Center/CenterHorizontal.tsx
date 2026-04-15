'use client';

import {XDSCenter} from '@xds/core/Center';

export default function CenterHorizontal() {
  return (
    <XDSCenter axis="horizontal">
      <div
        style={{
          width: 120,
          height: 40,
          background: 'var(--color-accent-muted)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        Logo
      </div>
    </XDSCenter>
  );
}
