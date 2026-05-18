// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSCenter} from '@xds/core/Center';

export default function AspectRatioWidescreen() {
  return (
    <XDSCenter width={600}>
      <XDSAspectRatio ratio={16 / 9}>
        <img
          src="https://lookaside.facebook.com/assets/xds_oss/light-scene-horizontal-1.png"
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
