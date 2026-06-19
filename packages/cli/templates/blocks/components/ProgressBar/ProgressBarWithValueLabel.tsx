// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ProgressBar} from '@xds/core/ProgressBar';

export default function ProgressBarWithValueLabel() {
  return (
    <ProgressBar
      value={75}
      label="Storage used"
      hasValueLabel
      style={{width: 300}}
    />
  );
}
