// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSCenter} from '@xds/core/Center';

export default function AspectRatioCircleImage() {
  return (
    <XDSCenter width={300}>
      <XDSAspectRatio isCircle>
        <img
          src="https://lookaside.facebook.com/assets/xds_oss/light-home-square-1.png"
          alt="Circular image"
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
