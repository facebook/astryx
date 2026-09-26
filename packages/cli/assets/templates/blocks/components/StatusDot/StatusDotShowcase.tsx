// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {StatusDot} from '@astryxdesign/core/StatusDot';
import {HStack} from '@astryxdesign/core/Layout';

export default function StatusDotShowcase() {
  return (
    <HStack gap={2} vAlign="center">
      <StatusDot variant="success" label="Positive" />
      <StatusDot variant="warning" label="Warning" />
      <StatusDot variant="error" label="Negative" />
      <StatusDot variant="accent" label="Info" />
      <StatusDot variant="neutral" label="Neutral" />
    </HStack>
  );
}
