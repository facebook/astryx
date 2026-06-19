// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {FieldStatus} from '@xds/core/FieldStatus';
import {VStack} from '@xds/core/Layout';

export default function FieldStatusShowcase() {
  return (
    <VStack gap={4}>
      <FieldStatus
        type="error"
        message="This field is required"
        variant="detached"
      />
      <FieldStatus
        type="warning"
        message="This username is already taken by another team"
        variant="detached"
      />
      <FieldStatus
        type="success"
        message="Your changes have been saved"
        variant="detached"
      />
    </VStack>
  );
}
