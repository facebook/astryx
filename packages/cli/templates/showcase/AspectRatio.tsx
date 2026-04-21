'use client';

import {XDSAspectRatio} from '@xds/core/AspectRatio';

export default function AspectRatioShowcase() {
  return (
    <XDSAspectRatio ratio={16 / 9}>
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
        }}>
        16:9
      </div>
    </XDSAspectRatio>
  );
}
