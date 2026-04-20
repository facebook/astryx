'use client';

import {useState} from 'react';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';

export default function CheckboxInputWithErrorStatus() {
  const [value, setValue] = useState<boolean | 'indeterminate'>(false);
  return (
    <XDSCheckboxInput
      label="Accept terms and conditions"
      value={value}
      onChange={setValue}
      status={{type: 'error', message: 'You must accept the terms to continue'}}
    />
  );
}
