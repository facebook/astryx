'use client';

import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSCenter} from '@xds/core/Center';

export default function AspectRatioWidescreen() {
  return (
    <XDSCenter width={600}>
      <XDSAspectRatio ratio={16 / 9}>
        <img
          src="https://picsum.photos/800/450"
          alt="16:9 widescreen"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </XDSAspectRatio>
    </XDSCenter>
  );
}
