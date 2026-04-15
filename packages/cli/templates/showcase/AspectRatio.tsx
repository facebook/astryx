'use client';

import {XDSAspectRatio} from '@xds/core/AspectRatio';

export default function AspectRatioShowcase() {
  return (
    <XDSAspectRatio ratio={16 / 9}>
      <div style={{background: '#eee', height: '100%'}} />
    </XDSAspectRatio>
  );
}
