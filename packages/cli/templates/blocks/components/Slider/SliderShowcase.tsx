// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Slider} from '@xds/core/Slider';

export default function SliderShowcase() {
  return <Slider label="Volume" value={50} style={{width: 300}} />;
}
