'use client';

import {useState} from 'react';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';

export default function CheckboxInputStatusVariations() {
  const [value1, setValue1] = useState<boolean | 'indeterminate'>(false);
  const [value2, setValue2] = useState<boolean | 'indeterminate'>(true);
  const [value3, setValue3] = useState<boolean | 'indeterminate'>(true);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 400}}>
      <XDSCheckboxInput
        label="Accept terms and conditions"
        value={value1}
        onChange={setValue1}
        status={{type: 'error', message: 'You must accept the terms to continue'}}
      />
      <XDSCheckboxInput
        label="Share usage data"
        description="Help us improve by sharing anonymous usage statistics"
        value={value2}
        onChange={setValue2}
        status={{type: 'warning', message: 'This data may be shared with partners'}}
      />
      <XDSCheckboxInput
        label="Email verified"
        value={value3}
        onChange={setValue3}
        status={{type: 'success', message: 'Your email has been verified'}}
      />
    </div>
  );
}
