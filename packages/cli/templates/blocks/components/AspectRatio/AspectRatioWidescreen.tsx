'use client';

import {XDSAspectRatio} from '@xds/core/AspectRatio';

export default function AspectRatioWidescreen() {
  return (
    <XDSAspectRatio ratio={16 / 9}>
      <img
        src="https://placehold.co/640x360"
        alt="Widescreen image"
        style={{objectFit: 'cover', width: '100%', height: '100%'}}
      />
    </XDSAspectRatio>
  );
}
