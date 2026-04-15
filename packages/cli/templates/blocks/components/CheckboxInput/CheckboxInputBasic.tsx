'use client';

import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {useState} from 'react';

export default function CheckboxInputBasic() {
  const [accepted, setAccepted] = useState(false);
  return (
    <XDSCheckboxInput
      label="Accept terms and conditions"
      value={accepted}
      onChange={setAccepted}
    />
  );
}
