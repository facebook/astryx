'use client';

import {XDSAspectRatio} from '@xds/core/AspectRatio';

export default function AspectRatioVideo() {
  return (
    <XDSAspectRatio ratio={4 / 3}>
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}>
        4:3 video placeholder
      </div>
    </XDSAspectRatio>
  );
}
