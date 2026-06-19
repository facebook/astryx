// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSFieldStatus} from '@xds/core/FieldStatus';
import {XDSVStack} from '@xds/core/Layout';

export default function FieldStatusShowcase() {
  return (
    <XDSVStack gap={4}>
      <XDSFieldStatus
        type="error"
        message="This field is required"
        variant="detached"
      />
      <XDSFieldStatus
        type="warning"
        message="This username is already taken by another team"
        variant="detached"
      />
      <XDSFieldStatus
        type="success"
        message="Your changes have been saved"
        variant="detached"
      />
    </XDSVStack>
  );
}
