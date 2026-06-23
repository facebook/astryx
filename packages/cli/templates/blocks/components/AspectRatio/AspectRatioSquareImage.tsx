// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {AspectRatio} from '@xds/core/AspectRatio';
import {Center} from '@xds/core/Center';

export default function AspectRatioSquareImage() {
  return (
    <Center width={300}>
      <AspectRatio ratio={1}>
        <img
          src="https://lookaside.facebook.com/assets/astryx/light-home-square-1.png"
          alt="1:1 square"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </AspectRatio>
    </Center>
  );
}
