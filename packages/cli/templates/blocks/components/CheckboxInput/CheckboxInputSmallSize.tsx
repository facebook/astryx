'use client';

import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {useState} from 'react';

export default function CheckboxInputSmallSize() {
  const [checked, setChecked] = useState(false);
  return (
    <XDSCheckboxInput
      label="Compact checkbox"
      value={checked}
      onChange={setChecked}
      size="sm"
    />
  );
}
