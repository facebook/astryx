// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Center} from '@astryxdesign/core/Center';

export default function AspectRatioCircleImage() {
  return (
    <Center width={300}>
      <AspectRatio ratio={1} shape="ellipse" fit="cover">
        <img
          src="/template-assets/light-home-square-1.png"
          alt="Circular image"
        />
      </AspectRatio>
    </Center>
  );
}
