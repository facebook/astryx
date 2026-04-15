'use client';

import {XDSAspectRatio} from '@xds/core/AspectRatio';

export default function AspectRatioSquare() {
  return (
    <XDSAspectRatio ratio={1}>
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'var(--color-accent-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        Square content
      </div>
    </XDSAspectRatio>
  );
}
