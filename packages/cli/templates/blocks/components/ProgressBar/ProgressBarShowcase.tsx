// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ProgressBar} from '@xds/core/ProgressBar';

export default function ProgressBarShowcase() {
  return <ProgressBar value={60} label="Progress" style={{width: 300}} />;
}
