'use client';

import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSCenter} from '@xds/core/Center';

export default function AspectRatioSquareImage() {
  return (
    <XDSCenter width={300}>
      <XDSAspectRatio ratio={1}>
        <img
          src="https://picsum.photos/400/400"
          alt="1:1 square"
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
