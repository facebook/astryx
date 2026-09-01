// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {VStack} from '@astryxdesign/core/Layout';

export default function ProgressBarSemanticSelfContained() {
  return (
    <VStack gap={4} style={{width: 300}}>
      <ProgressBar value={60} label="Accent" variant="accent" />
      <ProgressBar value={80} label="Positive" variant="success" />
      <ProgressBar value={50} label="Warning" variant="warning" />
      <ProgressBar value={92} label="Negative" variant="error" />
      <ProgressBar value={35} label="Neutral" variant="neutral" />
    </VStack>
  );
}
