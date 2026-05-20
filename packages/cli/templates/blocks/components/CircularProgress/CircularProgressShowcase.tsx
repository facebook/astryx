// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSCircularProgress} from '@xds/core/CircularProgress';

export default function CircularProgressShowcase() {
  return (
    <XDSCircularProgress value={75} label="Progress" size="lg">
      75%
    </XDSCircularProgress>
  );
}
