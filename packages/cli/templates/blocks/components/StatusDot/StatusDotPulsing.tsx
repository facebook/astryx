// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSHStack} from '@xds/core/Layout';

export default function StatusDotPulsing() {
  return (
    <XDSHStack gap={2} vAlign="center">
      <XDSStatusDot variant="success" label="Live" isPulsing />
      <XDSStatusDot variant="warning" label="Processing" isPulsing />
      <XDSStatusDot variant="error" label="Error" isPulsing />
      <XDSStatusDot variant="accent" label="Processing" isPulsing />
      <XDSStatusDot variant="neutral" label="Error" isPulsing />
    </XDSHStack>
  );
}
