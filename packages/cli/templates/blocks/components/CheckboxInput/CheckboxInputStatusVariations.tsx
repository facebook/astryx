'use client';

import {useState} from 'react';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSStack} from '@xds/core/Layout';

export default function CheckboxInputStatusVariations() {
  const [terms, setTerms] = useState<boolean | 'indeterminate'>(false);
  const [sharing, setSharing] = useState<boolean | 'indeterminate'>(true);
  const [email, setEmail] = useState<boolean | 'indeterminate'>(true);

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSCheckboxInput
        label="Accept terms and conditions"
        value={terms}
        onChange={setTerms}
        status={{
          type: 'error',
          message: 'You must accept the terms to continue',
        }}
      />
      <XDSCheckboxInput
        label="Share usage data"
        description="Help us improve by sharing anonymous usage statistics"
        value={sharing}
        onChange={setSharing}
        status={{
          type: 'warning',
          message: 'This data may be shared with partners',
        }}
      />
      <XDSCheckboxInput
        label="Email verified"
        value={email}
        onChange={setEmail}
        status={{type: 'success', message: 'Your email has been verified'}}
      />
    </XDSStack>
  );
}
