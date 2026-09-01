// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {VStack} from '@astryxdesign/core/Layout';

export default function ProgressBarStates() {
  return (
    <VStack gap={4} style={{width: 300}}>
      <ProgressBar isIndeterminate label="Processing" />
      <ProgressBar
        value={60}
        label="Canceled upload"
        hasValueLabel
        isDisabled
      />
    </VStack>
  );
}
