'use client';

import {useState} from 'react';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';

export default function CheckboxInputIndeterminateState() {
  const [value, setValue] = useState<boolean | 'indeterminate'>('indeterminate');
  return (
    <XDSCheckboxInput
      label="Select all items"
      description="Some items are selected"
      value={value}
      onChange={setValue}
    />
  );
}
