// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSHStack} from '@xds/core/Layout';

export default function StatusDotShowcase() {
  return (
    <XDSHStack gap={2} vAlign="center">
      <XDSStatusDot variant="success" label="Positive" />
      <XDSStatusDot variant="warning" label="Warning" />
      <XDSStatusDot variant="error" label="Negative" />
      <XDSStatusDot variant="accent" label="Info" />
      <XDSStatusDot variant="neutral" label="Neutral" />
    </XDSHStack>
  );
}
