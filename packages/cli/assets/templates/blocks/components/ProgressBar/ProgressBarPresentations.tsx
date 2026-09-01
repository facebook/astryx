// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {VStack} from '@astryxdesign/core/Layout';

export default function ProgressBarPresentations() {
  return (
    <VStack gap={4} style={{width: 300}}>
      <ProgressBar value={60} label="Self-contained — graphic only" />
      <ProgressBar value={60} label="Paired with visible value" hasValueLabel />
    </VStack>
  );
}
