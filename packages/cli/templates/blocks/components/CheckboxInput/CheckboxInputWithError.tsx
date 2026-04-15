'use client';

import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {useState} from 'react';

export default function CheckboxInputWithError() {
  const [accepted, setAccepted] = useState(false);
  return (
    <XDSCheckboxInput
      label="Accept terms"
      value={accepted}
      onChange={setAccepted}
      status={{type: 'error', message: 'You must accept the terms to continue'}}
    />
  );
}
