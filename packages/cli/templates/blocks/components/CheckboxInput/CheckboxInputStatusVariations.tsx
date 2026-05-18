// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSStack} from '@xds/core/Layout';

export default function CheckboxInputStatusVariations() {
  const [error, setError] = useState<boolean | 'indeterminate'>(false);
  const [warning, setWarning] = useState<boolean | 'indeterminate'>(true);
  const [success, setSuccess] = useState<boolean | 'indeterminate'>(true);

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSCheckboxInput
        label="Error"
        description="Required field that has not been accepted."
        value={error}
        onChange={setError}
        status={{
          type: 'error',
          message: 'You must accept the terms to continue',
        }}
      />
      <XDSCheckboxInput
        label="Warning"
        description="Enabled setting with a side effect to be aware of."
        value={warning}
        onChange={setWarning}
        status={{
          type: 'warning',
          message: 'This data may be shared with partners',
        }}
      />
      <XDSCheckboxInput
        label="Success"
        description="Confirmed setting that has been verified."
        value={success}
        onChange={setSuccess}
        status={{type: 'success', message: 'Your email has been verified'}}
      />
    </XDSStack>
  );
}
