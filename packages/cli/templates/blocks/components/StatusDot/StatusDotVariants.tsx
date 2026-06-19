// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {StatusDot} from '@xds/core/StatusDot';
import {HStack} from '@xds/core/Layout';

export default function StatusDotVariants() {
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
