// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSFieldStatusComponent} from '@xds/core/Field';
import {XDSVStack} from '@xds/core/Layout';

export default function FieldStatusShowcase() {
  return (
    <XDSVStack gap={4}>
      <XDSFieldStatusComponent
        type="error"
        message="This field is required"
        variant="detached"
      />
      <XDSFieldStatusComponent
        type="warning"
        message="This username is already taken by another team"
        variant="detached"
      />
      <XDSFieldStatusComponent
        type="success"
        message="Your changes have been saved"
        variant="detached"
      />
    </XDSVStack>
  );
}
